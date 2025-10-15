#!/bin/bash

# FRP Client startup script
set -e

echo "Starting FRP Client..."

# Set default values if not provided
export SERVER_ADDR=${SERVER_ADDR:-"x.x.x.x"}
export SERVER_PORT=${SERVER_PORT:-7000}
export LOG_LEVEL=${LOG_LEVEL:-"info"}
export ADMIN_PORT=${ADMIN_PORT:-7400}
export ADMIN_USER=${ADMIN_USER:-"admin"}
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin"}
export TCP_MUX=${TCP_MUX:-true}
export HEARTBEAT_INTERVAL=${HEARTBEAT_INTERVAL:-30}
export HEARTBEAT_TIMEOUT=${HEARTBEAT_TIMEOUT:-90}

# Configure authentication section
if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "" ]; then
    export AUTH_SECTION="# Authentication
[auth]
method = \"token\"
token = \"$AUTH_TOKEN\""
    echo "  Auth Token: [CONFIGURED]"
else
    export AUTH_SECTION="# No authentication configured"
    echo "  Auth Token: [DISABLED]"
fi

echo "Configuration:"
echo "  Server: $SERVER_ADDR:$SERVER_PORT"
echo "  Log Level: $LOG_LEVEL"
echo "  Admin UI: http://localhost:$ADMIN_PORT"
echo "  Admin User: $ADMIN_USER"
echo "  TCP Mux: $TCP_MUX"

# Create configs directory
mkdir -p /app/configs

# If a specific configuration file is provided, use it
if [ -n "$CONFIG_FILE" ] && [ -f "$CONFIG_FILE" ]; then
    echo "Using provided configuration file: $CONFIG_FILE"
    cp "$CONFIG_FILE" /tmp/frpc.toml
else
    echo "Using template configuration"
    # Process template and create default configuration
    # Check for template in both possible locations
    if [ -f "/app/client/frpc.toml.template" ]; then
        # Combined image path
        envsubst < /app/client/frpc.toml.template > /tmp/frpc.toml
    elif [ -f "/app/frpc.toml.template" ]; then
        # Client-only image path
        envsubst < /app/frpc.toml.template > /tmp/frpc.toml
    else
        echo "❌ Error: frpc.toml.template not found"
        exit 1
    fi
fi

echo "Final configuration:"
cat /tmp/frpc.toml

# Start FRP client
echo "Starting FRP client..."
exec frpc -c /tmp/frpc.toml
