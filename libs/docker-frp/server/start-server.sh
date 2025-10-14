#!/bin/bash

# FRP Server startup script
set -e

echo "Starting FRP Server..."

# Set default values if not provided
export BIND_PORT=${BIND_PORT:-7000}
export DASHBOARD_PORT=${DASHBOARD_PORT:-7500}
export DASHBOARD_USER=${DASHBOARD_USER:-admin}
export DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD:-admin}
export LOG_LEVEL=${LOG_LEVEL:-info}
export TLS_ENABLE=${TLS_ENABLE:-false}
export TLS_CERT_FILE=${TLS_CERT_FILE:-""}
export TLS_KEY_FILE=${TLS_KEY_FILE:-""}
export VHOST_HTTP_PORT=${VHOST_HTTP_PORT:-8080}
export VHOST_HTTPS_PORT=${VHOST_HTTPS_PORT:-8443}

# Configure authentication section
if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "" ]; then
    export AUTH_SECTION="# Authentication method
[auth]
method = \"token\"
token = \"$AUTH_TOKEN\""
    echo "  Auth Token: [CONFIGURED]"
else
    export AUTH_SECTION="# No authentication configured"
    echo "  Auth Token: [DISABLED]"
fi

echo "Configuration:"
echo "  Bind Port: $BIND_PORT"
echo "  Dashboard Port: $DASHBOARD_PORT"
echo "  Dashboard User: $DASHBOARD_USER"
echo "  Log Level: $LOG_LEVEL"
echo "  TLS Enabled: $TLS_ENABLE"
echo "  VHost HTTP Port: $VHOST_HTTP_PORT"
echo "  VHost HTTPS Port: $VHOST_HTTPS_PORT"

# Process template and create final configuration
# Check for template in both possible locations
if [ -f "/app/server/frps.toml.template" ]; then
    # Combined image path
    envsubst < /app/server/frps.toml.template > /tmp/frps.toml
elif [ -f "/app/frps.toml.template" ]; then
    # Server-only image path
    envsubst < /app/frps.toml.template > /tmp/frps.toml
else
    echo "❌ Error: frps.toml.template not found"
    exit 1
fi

echo "Generated configuration:"
cat /tmp/frps.toml

# Start FRP server
exec frps -c /tmp/frps.toml
