#!/bin/bash

# Thales Auto Proxy - Automatic SSL Certificate Generator
# Generates self-signed SSL certificates for hostnames found in HOST_MAPPING

set -e

# Configuration
CERT_DIR="${CERT_DIR:-/etc/nginx/certs}"
CERT_VALIDITY_DAYS="${CERT_VALIDITY_DAYS:-365}"
KEY_SIZE="${KEY_SIZE:-2048}"
DOCKER_HOST="${DOCKER_HOST:-unix:///tmp/docker.sock}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create certificate directory if it doesn't exist
create_cert_directory() {
    if [[ ! -d "$CERT_DIR" ]]; then
        log_info "Creating certificate directory: $CERT_DIR"
        mkdir -p "$CERT_DIR"
        chmod 755 "$CERT_DIR"
    fi
}

# Generate self-signed certificate for a hostname
generate_certificate() {
    local hostname=$1
    local cert_file="$CERT_DIR/${hostname}.crt"
    local key_file="$CERT_DIR/${hostname}.key"
    local csr_file="$CERT_DIR/${hostname}.csr"

    # Skip if certificate already exists and is valid
    if [[ -f "$cert_file" && -f "$key_file" ]]; then
        # Check if certificate is still valid (not expired)
        if openssl x509 -in "$cert_file" -noout -checkend 86400 >/dev/null 2>&1; then
            log_info "Certificate for $hostname already exists and is valid"
            return 0
        else
            log_warning "Certificate for $hostname has expired, regenerating..."
        fi
    fi

    log_info "Generating SSL certificate for: $hostname"

    # Generate private key
    openssl genrsa -out "$key_file" $KEY_SIZE 2>/dev/null

    # Create certificate signing request
    openssl req -new -key "$key_file" -out "$csr_file" -subj "/CN=$hostname/O=Thales Auto Proxy/C=US" 2>/dev/null

    # Generate self-signed certificate with SAN
    openssl x509 -req -in "$csr_file" -signkey "$key_file" -out "$cert_file" -days $CERT_VALIDITY_DAYS \
        -extensions v3_req -extfile <(
        echo '[v3_req]'
        echo 'basicConstraints = CA:FALSE'
        echo 'keyUsage = nonRepudiation, digitalSignature, keyEncipherment'
        echo 'subjectAltName = @alt_names'
        echo '[alt_names]'
        echo "DNS.1 = $hostname"
        echo "DNS.2 = *.$hostname"
        echo "IP.1 = 127.0.0.1"
        echo "IP.2 = ::1"
    ) 2>/dev/null

    # Clean up CSR
    rm -f "$csr_file"

    # Set proper permissions
    chmod 644 "$cert_file"
    chmod 600 "$key_file"

    log_success "Generated certificate for $hostname"
    log_info "  Certificate: $cert_file"
    log_info "  Private key: $key_file"
}

# Extract hostnames from docker containers with HOST_MAPPING
extract_hostnames_from_docker() {
    local hostnames=()

    # Check if docker is available
    if ! command -v docker >/dev/null 2>&1; then
        log_warning "Docker command not available, skipping container discovery"
    else
        # Get containers with HOST_MAPPING environment variable
        log_info "Discovering containers with HOST_MAPPING..."

        # Wait a moment for containers to be fully ready
        sleep 2

        local containers
        # Get all running containers (not just compose services)
        containers=$(docker ps --format "{{.Names}}")
        if [[ -z "$containers" ]]; then
            log_warning "No Docker containers found"
        else
            while IFS= read -r container_name; do
                if [[ -z "$container_name" ]]; then
                    continue
                fi

                # Get HOST_MAPPING environment variable from container
                local host_mapping
                # Get HOST_MAPPING environment variable from container
                host_mapping=$(docker inspect "$container_name" --format '{{range .Config.Env}}{{if (index (split . "=") 0 | eq "HOST_MAPPING")}}{{index (split . "=") 1}}{{end}}{{end}}')

                if [[ -n "$host_mapping" ]]; then
                    log_info "Found HOST_MAPPING in container $container_name: $host_mapping"

                    # Parse HOST_MAPPING: PROTOCOL:::HOSTNAME:::PORT,PROTOCOL:::HOSTNAME:::PORT,...
                    IFS=',' read -ra mappings <<< "$host_mapping"
                    for mapping in "${mappings[@]}"; do
                        IFS=':::' read -ra parts <<< "$mapping"
                        if [[ ${#parts[@]} -eq 3 ]]; then
                            local protocol="${parts[0]}"
                            local hostname="${parts[1]}"
                            local port="${parts[2]}"

                            # Only generate certificates for HTTP and GRPC protocols with valid hostnames
                            if [[ "$protocol" == "HTTP" || "$protocol" == "GRPC" ]] && [[ "$hostname" =~ ^[a-zA-Z0-9.-]+$ ]]; then
                                # Avoid duplicates
                                if [[ ! " ${hostnames[*]} " =~ " ${hostname} " ]]; then
                                    hostnames+=("$hostname")
                                    log_info "Added hostname for certificate generation: $hostname"
                                fi
                            fi
                        fi
                    done
                fi
            done <<< "$containers"
        fi
    fi

    # Extract hostnames from STATIC_PROXIES environment variable
    local static_proxies="${STATIC_PROXIES:-}"
    if [[ -n "$static_proxies" ]]; then
        log_info "Discovering static proxies from STATIC_PROXIES: $static_proxies"

        # Parse STATIC_PROXIES: PROTOCOL:::HOSTNAME:::PORT=>TARGET_HOST:::TARGET_PORT,PROTOCOL:::...
        IFS=',' read -ra mappings <<< "$static_proxies"
        for mapping in "${mappings[@]}"; do
            # Split by => to get proxy config part
            local proxy_part="${mapping%%=>*}"

            # Split proxy part by ::: delimiter
            IFS=':::' read -ra parts <<< "$proxy_part"
            if [[ ${#parts[@]} -eq 3 ]]; then
                local protocol="${parts[0]}"
                local hostname="${parts[1]}"
                local port="${parts[2]}"

                # Only generate certificates for HTTP and GRPC protocols with valid hostnames
                if [[ "$protocol" == "HTTP" || "$protocol" == "GRPC" ]] && [[ "$hostname" =~ ^[a-zA-Z0-9.-]+$ ]]; then
                    # Avoid duplicates
                    if [[ ! " ${hostnames[*]} " =~ " ${hostname} " ]]; then
                        hostnames+=("$hostname")
                        log_info "Added static hostname for certificate generation: $hostname"
                    fi
                fi
            fi
        done
    fi

    # Generate certificates for all discovered hostnames
    for hostname in "${hostnames[@]}"; do
        generate_certificate "$hostname"
    done

    if [[ ${#hostnames[@]} -eq 0 ]]; then
        log_info "No hostnames found in HOST_MAPPING environment variables"
    else
        log_success "Processed ${#hostnames[@]} hostname(s) for certificate generation"
    fi
}

# Extract hostnames from command line arguments
extract_hostnames_from_args() {
    for hostname in "$@"; do
        if [[ "$hostname" =~ ^[a-zA-Z0-9.-]+$ ]]; then
            generate_certificate "$hostname"
        else
            log_warning "Invalid hostname format: $hostname"
        fi
    done
}

# Main function
main() {
    log_info "Thales Auto Proxy - SSL Certificate Generator"
    log_info "Certificate directory: $CERT_DIR"
    log_info "Certificate validity: $CERT_VALIDITY_DAYS days"

    # Create certificate directory
    create_cert_directory

    if [[ $# -gt 0 ]]; then
        # Generate certificates for hostnames provided as arguments
        log_info "Generating certificates for provided hostnames..."
        extract_hostnames_from_args "$@"
    else
        # Auto-discover hostnames from Docker containers
        extract_hostnames_from_docker
    fi

    log_success "Certificate generation completed"
}

# Run main function with all arguments
main "$@"
