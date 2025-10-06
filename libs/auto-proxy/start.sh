#!/bin/bash

# Thales Auto Proxy Startup Script
# This script starts the auto proxy with event-driven SSL certificate management

set -e

# Configuration
AUTO_SSL="${AUTO_SSL:-true}"
CERT_DIR="${CERT_DIR:-/etc/nginx/certs}"

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[AUTO-PROXY-START]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[AUTO-PROXY-START]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AUTO-PROXY-START]${NC} $1"
}

log_error() {
    echo -e "${RED}[AUTO-PROXY-START]${NC} $1"
}

log_info "🚀 Starting Thales Auto Proxy..."
log_info "Event-driven architecture enabled"

# Create certificate directory
mkdir -p "$CERT_DIR"

if [[ "$AUTO_SSL" == "true" ]]; then
    log_info "Auto SSL enabled - using orchestrator"
    log_success "Starting event-driven SSL orchestrator..."

    # Start the orchestrator which handles:
    # - Initial certificate generation
    # - Docker event monitoring
    # - Nginx lifecycle management
    # - Configuration updates
    exec /app/orchestrator.sh
else
    log_warning "Auto SSL disabled - using simple mode"

    # Generate default certificate for simple mode
    if [[ ! -f "$CERT_DIR/default.crt" ]] || [[ ! -f "$CERT_DIR/default.key" ]]; then
        log_info "Generating default SSL certificate..."
        /app/generate-certs.sh "default"
    fi

    # Generate initial nginx configuration
    log_info "Generating initial nginx configuration..."
    docker-gen "/app/nginx.tmpl" "/etc/nginx/conf.d/default.conf"

    # Start docker-gen in watch mode and nginx
    log_info "Starting docker-gen in watch mode..."
    docker-gen -watch -notify "nginx -s reload" "/app/nginx.tmpl" "/etc/nginx/conf.d/default.conf" &

    log_info "Starting nginx..."
    exec nginx -g "daemon off;"
fi
