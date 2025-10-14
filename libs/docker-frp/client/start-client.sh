#!/bin/bash

# FRP Client startup script
set -e

echo "Starting FRP Client with Web GUI..."

# Set default values if not provided
export SERVER_ADDR=${SERVER_ADDR:-"x.x.x.x"}
export SERVER_PORT=${SERVER_PORT:-7000}
export AUTH_TOKEN=${AUTH_TOKEN:-"default_token_12345"}
export LOG_LEVEL=${LOG_LEVEL:-"info"}
export ADMIN_PORT=${ADMIN_PORT:-7400}
export TCP_MUX=${TCP_MUX:-true}
export HEARTBEAT_INTERVAL=${HEARTBEAT_INTERVAL:-30}
export HEARTBEAT_TIMEOUT=${HEARTBEAT_TIMEOUT:-90}

echo "Configuration:"
echo "  Server: $SERVER_ADDR:$SERVER_PORT"
echo "  Auth Token: [REDACTED]"
echo "  Log Level: $LOG_LEVEL"
echo "  Admin Port: $ADMIN_PORT"
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
    envsubst < /app/client/frpc.toml.template > /tmp/frpc.toml
fi

echo "Final configuration:"
cat /tmp/frpc.toml

# Start the web server in the background
echo "Starting web interface on port $WEB_PORT..."
cd /app/client-web
node server.js &
WEB_PID=$!

# Wait a moment for the web server to start
sleep 2

echo ""
echo "🎉 FRP Client is ready!"
echo ""
echo "📱 Web Interface: http://localhost:${WEB_PORT:-3000}"
echo "🔧 Admin UI: http://localhost:$ADMIN_PORT (when client is running)"
echo ""
echo "ℹ️  Use the web interface to configure and start your FRP client"
echo ""

# Keep the container running
wait $WEB_PID
