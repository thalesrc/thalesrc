#!/bin/bash

# Docker FRP Entrypoint Script
# Handles both server and client modes based on MODE environment variable

set -e

echo "🚀 Starting Docker FRP Container..."
echo "Mode: ${MODE:-server}"
echo "Build: $(date)"

# Function to display usage information
show_usage() {
    echo ""
    echo "Docker FRP - Fast Reverse Proxy Container"
    echo "==========================================="
    echo ""
    echo "MODES:"
    echo "  server  - Run FRP server mode (default)"
    echo "  client  - Run FRP client mode with admin UI"
    echo ""
    echo "SERVER MODE Environment Variables:"
    echo "  BIND_PORT         - FRP server bind port (default: 7000)"
    echo "  DASHBOARD_PORT    - Dashboard web port (default: 7500)"
    echo "  DASHBOARD_USER    - Dashboard username (default: admin)"
    echo "  DASHBOARD_PASSWORD - Dashboard password (default: admin)"
    echo "  AUTH_TOKEN        - Authentication token (default: default_token_12345)"
    echo "  LOG_LEVEL         - Log level (default: info)"
    echo "  TLS_ENABLE        - Enable TLS (default: false)"
    echo "  VHOST_HTTP_PORT   - HTTP vhost port (default: 8080)"
    echo "  VHOST_HTTPS_PORT  - HTTPS vhost port (default: 8443)"
    echo ""
    echo "CLIENT MODE Environment Variables:"
    echo "  SERVER_ADDR       - FRP server address (default: x.x.x.x)"
    echo "  SERVER_PORT       - FRP server port (default: 7000)"
    echo "  AUTH_TOKEN        - Authentication token (optional)"
    echo "  ADMIN_PORT        - Admin UI port (default: 7400)"
    echo "  ADMIN_USER        - Admin UI username (default: admin)"
    echo "  ADMIN_PASSWORD    - Admin UI password (default: admin)"
    echo "  CONFIG_FILE       - Custom config file path (optional)"
    echo ""
    echo "EXAMPLES:"
    echo "  # Server mode"
    echo "  docker run -p 7000:7000 -p 7500:7500 -e MODE=server thalesrc/docker-frp"
    echo ""
    echo "  # Client mode with admin UI"
    echo "  docker run -p 7400:7400 -e MODE=client thalesrc/docker-frp"
    echo ""
    echo "  # Server with custom settings"
    echo "  docker run -p 7000:7000 -p 7500:7500 \\"
    echo "    -e MODE=server \\"
    echo "    -e BIND_PORT=7000 \\"
    echo "    -e DASHBOARD_USER=myuser \\"
    echo "    -e DASHBOARD_PASSWORD=mypass \\"
    echo "    thalesrc/docker-frp"
    echo ""
}

# Check if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ] || [ "$1" = "help" ]; then
    show_usage
    exit 0
fi

# Determine mode
MODE=${MODE:-server}

case "$MODE" in
    "server")
        echo "🖥️  Starting in SERVER mode..."
        echo "   📡 Bind Port: ${BIND_PORT:-7000}"
        echo "   🌐 Dashboard: http://localhost:${DASHBOARD_PORT:-7500}"
        echo "   👤 Dashboard User: ${DASHBOARD_USER:-admin}"
        echo ""

        # Check if frps binary exists
        if ! command -v frps &> /dev/null; then
            echo "❌ Error: frps binary not found"
            exit 1
        fi

        # Set executable permissions for server script
        if [ -f "/app/server/start-server.sh" ]; then
            # Combined image path
            chmod +x /app/server/start-server.sh
            exec /app/server/start-server.sh
        elif [ -f "/app/start-server.sh" ]; then
            # Server-only image path
            chmod +x /app/start-server.sh
            exec /app/start-server.sh
        else
            echo "❌ Error: start-server.sh not found"
            exit 1
        fi
        ;;

    "client")
        echo "💻 Starting in CLIENT mode..."
        echo "   🔧 Server: ${SERVER_ADDR:-x.x.x.x}:${SERVER_PORT:-7000}"
        echo "   🌐 Admin UI: http://localhost:${ADMIN_PORT:-7400}"
        echo ""

        # Check if frpc binary exists
        if ! command -v frpc &> /dev/null; then
            echo "❌ Error: frpc binary not found"
            exit 1
        fi

        # Set executable permissions for client script
        if [ -f "/app/client/start-client.sh" ]; then
            # Combined image path
            chmod +x /app/client/start-client.sh
            exec /app/client/start-client.sh
        elif [ -f "/app/start-client.sh" ]; then
            # Client-only image path
            chmod +x /app/start-client.sh
            exec /app/start-client.sh
        else
            echo "❌ Error: start-client.sh not found"
            exit 1
        fi
        ;;

    *)
        echo "❌ Error: Invalid MODE '$MODE'"
        echo "   Valid modes: server, client"
        echo ""
        show_usage
        exit 1
        ;;
esac
