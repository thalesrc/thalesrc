#!/bin/bash

# FRP Server startup script
set -e

echo "Starting FRP Server..."

# Set default values if not provided
export BIND_PORT=${BIND_PORT:-7000}
export DASHBOARD_PORT=${DASHBOARD_PORT:-7500}
export DASHBOARD_USER=${DASHBOARD_USER:-admin}
export DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD:-admin}
export AUTH_TOKEN=${AUTH_TOKEN:-default_token_12345}
export LOG_LEVEL=${LOG_LEVEL:-info}
export TLS_ENABLE=${TLS_ENABLE:-false}
export TLS_CERT_FILE=${TLS_CERT_FILE:-""}
export TLS_KEY_FILE=${TLS_KEY_FILE:-""}
export VHOST_HTTP_PORT=${VHOST_HTTP_PORT:-8080}
export VHOST_HTTPS_PORT=${VHOST_HTTPS_PORT:-8443}

echo "Configuration:"
echo "  Bind Port: $BIND_PORT"
echo "  Dashboard Port: $DASHBOARD_PORT"
echo "  Dashboard User: $DASHBOARD_USER"
echo "  Log Level: $LOG_LEVEL"
echo "  TLS Enabled: $TLS_ENABLE"
echo "  VHost HTTP Port: $VHOST_HTTP_PORT"
echo "  VHost HTTPS Port: $VHOST_HTTPS_PORT"

# Process template and create final configuration
envsubst < /app/server/frps.toml.template > /tmp/frps.toml

echo "Generated configuration:"
cat /tmp/frps.toml

# Start FRP server
exec frps -c /tmp/frps.toml
