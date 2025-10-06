#!/bin/bash

# Thales Auto Proxy - Event-Driven SSL Certificate Orchestrator
# This script implements the robust approach:
# 1. Listen for Docker container changes
# 2. Stop nginx gracefully
# 3. Scan containers for HOST_MAPPING
# 4. Generate missing SSL certificates
# 5. Update nginx config
# 6. Start nginx
# 7. Repeat cycle

set -e

# Configuration
CERT_DIR="${CERT_DIR:-/etc/nginx/certs}"
NGINX_CONF="/etc/nginx/conf.d/default.conf"
NGINX_TEMPLATE="/app/nginx.tmpl"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[ORCHESTRATOR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[ORCHESTRATOR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[ORCHESTRATOR]${NC} $1"
}

log_error() {
    echo -e "${RED}[ORCHESTRATOR]${NC} $1"
}

log_cycle() {
    echo -e "${PURPLE}[CYCLE]${NC} $1"
}

# PID tracking
NGINX_PID=""
DOCKER_GEN_PID=""

# Cleanup function
cleanup() {
    log_warning "Shutting down orchestrator..."
    if [[ -n "$NGINX_PID" ]]; then
        log_info "Stopping nginx (PID: $NGINX_PID)"
        kill -TERM "$NGINX_PID" 2>/dev/null || true
        wait "$NGINX_PID" 2>/dev/null || true
    fi
    if [[ -n "$DOCKER_GEN_PID" ]]; then
        log_info "Stopping docker-gen (PID: $DOCKER_GEN_PID)"
        kill -TERM "$DOCKER_GEN_PID" 2>/dev/null || true
        wait "$DOCKER_GEN_PID" 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Stop nginx gracefully
stop_nginx() {
    if [[ -n "$NGINX_PID" ]] && kill -0 "$NGINX_PID" 2>/dev/null; then
        log_info "Stopping nginx gracefully..."
        kill -TERM "$NGINX_PID" 2>/dev/null || true
        wait "$NGINX_PID" 2>/dev/null || true
        NGINX_PID=""
        log_success "Nginx stopped"
        return 0
    fi
    return 1
}

# Start nginx
start_nginx() {
    if [[ -n "$NGINX_PID" ]] && kill -0 "$NGINX_PID" 2>/dev/null; then
        log_warning "Nginx already running (PID: $NGINX_PID)"
        return 0
    fi

    log_info "Starting nginx..."
    nginx -g "daemon off;" &
    NGINX_PID=$!
    log_success "Nginx started (PID: $NGINX_PID)"
}

# Discover containers with HOST_MAPPING
discover_hostnames() {
    local hostnames=()

    log_info "Discovering containers with HOST_MAPPING..." >&2

    # Get all running containers
    local containers
    containers=$(docker ps --format "{{.Names}}" 2>/dev/null || echo "")

    if [[ -z "$containers" ]]; then
        log_warning "No containers found" >&2
        echo ""
        return
    fi

    while IFS= read -r container_name; do
        if [[ -z "$container_name" ]] || [[ "$container_name" == "thales-auto-proxy" ]]; then
            continue
        fi

        # Get HOST_MAPPING environment variable
        local host_mapping
        host_mapping=$(docker inspect "$container_name" --format '{{range .Config.Env}}{{if (index (split . "=") 0 | eq "HOST_MAPPING")}}{{index (split . "=") 1}}{{end}}{{end}}' 2>/dev/null || echo "")

        if [[ -n "$host_mapping" ]]; then
            log_info "Found HOST_MAPPING in $container_name: $host_mapping" >&2

            # Parse HOST_MAPPING: PROTOCOL:::HOSTNAME:::PORT,PROTOCOL:::HOSTNAME:::PORT,...
            IFS=',' read -ra mappings <<< "$host_mapping"
            for mapping in "${mappings[@]}"; do
                # Split by ::: delimiter using string replacement
                local protocol="${mapping%%:::*}"
                local remainder="${mapping#*:::}"
                local hostname="${remainder%%:::*}"
                local port="${remainder#*:::}"

                # Only include HTTP and GRPC protocols with valid hostnames
                if [[ -n "$protocol" && -n "$hostname" && -n "$port" ]] && [[ "$protocol" == "HTTP" || "$protocol" == "GRPC" ]] && [[ "$hostname" =~ ^[a-zA-Z0-9.-]+$ ]]; then
                    # Avoid duplicates
                    if [[ ! " ${hostnames[*]} " =~ " ${hostname} " ]]; then
                        hostnames+=("$hostname")
                        log_success "Discovered hostname: $hostname" >&2
                    fi
                fi
            done
        fi
    done <<< "$containers"

    # Return hostnames as space-separated string
    echo "${hostnames[*]}"
}

# Check if SSL configuration changes are needed (without stopping nginx)
check_ssl_changes_needed() {
    local hostnames="$1"
    local changes_needed=false

    log_info "Checking if SSL configuration changes are needed..."

    # Create certificate directory if it doesn't exist
    mkdir -p "$CERT_DIR"

    # Check if default certificate exists
    if [[ ! -f "$CERT_DIR/default.crt" ]] || [[ ! -f "$CERT_DIR/default.key" ]]; then
        log_info "Default SSL certificate missing"
        changes_needed=true
    fi

    # Check each hostname for missing certificates
    if [[ -n "$hostnames" ]]; then
        for hostname in $hostnames; do
            local cert_file="$CERT_DIR/${hostname}.crt"
            local key_file="$CERT_DIR/${hostname}.key"

            if [[ ! -f "$cert_file" ]] || [[ ! -f "$key_file" ]]; then
                log_info "SSL certificate missing for: $hostname"
                changes_needed=true
            fi
        done
    fi

    # Check if nginx config exists and is readable
    if [[ ! -f "$NGINX_CONF" ]] || [[ ! -r "$NGINX_CONF" ]]; then
        log_info "Nginx configuration missing or unreadable"
        changes_needed=true
    fi

    if [[ "$changes_needed" == "true" ]]; then
        return 0  # Changes needed
    else
        log_info "No SSL configuration changes needed"
        return 1  # No changes needed
    fi
}

# Generate missing SSL certificates (called only when changes are needed)
ensure_certificates() {
    local hostnames="$1"
    local missing_certs=()

    log_info "Ensuring SSL certificates are available..."

    # Generate default certificate if it doesn't exist
    if [[ ! -f "$CERT_DIR/default.crt" ]] || [[ ! -f "$CERT_DIR/default.key" ]]; then
        log_info "Generating default SSL certificate..."
        /app/generate-certs.sh "default" >/dev/null 2>&1 || {
            log_error "Failed to generate default certificate"
            return 1
        }
    fi

    # Check each hostname and collect missing ones
    if [[ -n "$hostnames" ]]; then
        for hostname in $hostnames; do
            local cert_file="$CERT_DIR/${hostname}.crt"
            local key_file="$CERT_DIR/${hostname}.key"

            if [[ ! -f "$cert_file" ]] || [[ ! -f "$key_file" ]]; then
                missing_certs+=("$hostname")
            fi
        done
    fi

    # Generate missing certificates
    if [[ ${#missing_certs[@]} -gt 0 ]]; then
        log_info "Generating SSL certificates for: ${missing_certs[*]}"
        /app/generate-certs.sh "${missing_certs[@]}" >/dev/null 2>&1 || {
            log_error "Failed to generate certificates for: ${missing_certs[*]}"
            return 1
        }
        log_success "Generated ${#missing_certs[@]} SSL certificate(s)"
    fi

    return 0
}

# Update nginx configuration
update_nginx_config() {
    log_info "Updating nginx configuration..."

    # Generate new configuration using docker-gen
    docker-gen "$NGINX_TEMPLATE" "$NGINX_CONF" || {
        log_error "Failed to generate nginx configuration"
        return 1
    }

    log_success "Nginx configuration updated"
}

# Main orchestration cycle
orchestration_cycle() {
    log_cycle "Starting orchestration cycle..."

    # Discover hostnames from containers
    local hostnames
    hostnames=$(discover_hostnames)

    # Check if SSL configuration changes are needed (without stopping nginx)
    if check_ssl_changes_needed "$hostnames"; then
        log_info "SSL configuration changes detected - updating certificates and config"

        # Now stop nginx since we need to make changes
        stop_nginx

        # Generate missing certificates
        ensure_certificates "$hostnames" || {
            log_error "Failed to ensure certificates"
            return 1
        }

        # Update nginx configuration
        update_nginx_config || {
            log_error "Failed to update nginx configuration"
            return 1
        }

        # Start nginx
        start_nginx

        log_success "SSL certificates and configuration updated"
        log_cycle "Orchestration cycle completed with changes"
        return 0
    else
        log_info "No SSL configuration changes needed - nginx continues running"
        log_cycle "Orchestration cycle completed without changes"
        return 1
    fi
}

# Initial startup
initial_startup() {
    log_info "🚀 Starting Thales Auto Proxy Orchestrator..."
    log_info "Smart SSL certificate management enabled - nginx stops only when needed"

    # Run initial orchestration cycle
    if orchestration_cycle; then
        log_success "SSL configuration initialized"
    else
        log_info "SSL configuration already up to date"
    fi

    log_success "✅ Initial startup completed"
}

# Monitor docker events and trigger orchestration
monitor_docker_events() {
    log_info "📡 Starting Docker event monitoring..."

    # Monitor docker events for container start/stop/die events
    docker events --filter event=start --filter event=stop --filter event=die --format "{{.Status}} {{.Actor.Attributes.name}}" | while read -r event; do
        local status=$(echo "$event" | cut -d' ' -f1)
        local container=$(echo "$event" | cut -d' ' -f2)

        # Skip events for our own container
        if [[ "$container" == "thales-auto-proxy" ]]; then
            continue
        fi

        log_cycle "Docker event: $status $container"

        # Trigger orchestration cycle on container changes
        if orchestration_cycle; then
            log_success "SSL configuration updated due to container changes"
        else
            log_info "No SSL changes needed for container event"
        fi

    done &

    DOCKER_GEN_PID=$!
    log_success "Docker event monitoring started (PID: $DOCKER_GEN_PID)"
}

# Main function
main() {
    # Run initial startup
    initial_startup

    # Start monitoring docker events
    monitor_docker_events

    # Keep the script running and monitor nginx
    while true; do
        # Check if nginx is still running
        if [[ -n "$NGINX_PID" ]] && ! kill -0 "$NGINX_PID" 2>/dev/null; then
            log_warning "Nginx process died, restarting..."
            NGINX_PID=""
            start_nginx
        fi

        # Wait before next check
        sleep 10
    done
}

# Run main function
main "$@"
