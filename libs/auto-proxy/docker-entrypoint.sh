#!/bin/bash
set -e

# Print version information
function _print_version() {
    if [[ -n "${THALES_AUTO_PROXY_VERSION:-}" ]]; then
        echo "Info: running thales-auto-proxy version ${THALES_AUTO_PROXY_VERSION}"
    else
        echo "Info: running thales-auto-proxy (development version)"
    fi
}

# Check if Docker socket is available
function _check_unix_socket() {
    if [[ ${DOCKER_HOST:-unix:///var/run/docker.sock} == unix://* ]]; then
        local SOCKET_FILE="${DOCKER_HOST#unix://}"
        SOCKET_FILE="${SOCKET_FILE:-/var/run/docker.sock}"

        if [[ ! -S ${SOCKET_FILE} ]]; then
            cat >&2 <<-EOT
				ERROR: you need to share your Docker host socket with a volume at ${SOCKET_FILE}
				Typically you should run your thales-auto-proxy with: \`-v /var/run/docker.sock:${SOCKET_FILE}:ro\`
				See the documentation for more details.
			EOT
            exit 1
        fi
    fi
}

# Set up DNS resolvers
function _resolvers() {
    # Compute the DNS resolvers for use in the templates
    RESOLVERS=$(awk '$1 == "nameserver" {print ($2 ~ ":")? "["$2"]": $2}' ORS=' ' /etc/resolv.conf | sed 's/ *$//g')
    export RESOLVERS

    if [[ -z ${RESOLVERS} ]]; then
        echo 'Warning: unable to determine DNS resolvers for nginx' >&2
        unset RESOLVERS
    fi
}

# Generate dhparam file if it doesn't exist
function _dhparam() {
    local DHPARAM_BITS="${DHPARAM_BITS:-2048}"
    local DHPARAM_FILE="/etc/nginx/dhparam/dhparam.pem"

    # Create dhparam directory
    mkdir -p /etc/nginx/dhparam

    if [[ ! -f ${DHPARAM_FILE} ]]; then
        echo "Generating dhparam file with ${DHPARAM_BITS} bits..."
        openssl dhparam -out ${DHPARAM_FILE} ${DHPARAM_BITS}
    fi
}

# SSL certificate generation is now handled by the orchestrator

# Create necessary directories
function _setup_directories() {
    mkdir -p /etc/nginx/conf.d
    mkdir -p /etc/nginx/vhost.d
    mkdir -p /etc/nginx/certs
    mkdir -p /etc/nginx/dhparam
    mkdir -p /var/log/nginx
    mkdir -p /usr/share/nginx/html
}

# Create a default error page
function _create_error_pages() {
    cat > /usr/share/nginx/html/50x.html <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Service Unavailable</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
        h1 { color: #666; }
    </style>
</head>
<body>
    <h1>503 - Service Unavailable</h1>
    <p>The service you are trying to reach is currently unavailable.</p>
    <p><em>Thales Auto Proxy</em></p>
</body>
</html>
EOF
}

# Main initialization
function _init() {
    _print_version
    _check_unix_socket
    _resolvers
    _setup_directories
    _create_error_pages
    _dhparam
    # SSL certificate generation is now handled by the orchestrator
}

# Run initialization
_init

# Set defaults
export HOST_MAPPING="${HOST_MAPPING:-}"
export STATIC_PROXIES="${STATIC_PROXIES:-}"
export TARGET_HOST="${TARGET_HOST:-host.docker.internal}"
export HTTP_PORT="${HTTP_PORT:-80}"
export HTTPS_PORT="${HTTPS_PORT:-443}"
export DEFAULT_HOST="${DEFAULT_HOST:-}"
export DEFAULT_ROOT="${DEFAULT_ROOT:-404}"
export ENABLE_IPV6="${ENABLE_IPV6:-false}"
export SSL_POLICY="${SSL_POLICY:-Mozilla-Intermediate}"

echo "Starting Thales Auto Proxy..."
echo "HOST_MAPPING: ${HOST_MAPPING}"
echo "STATIC_PROXIES: ${STATIC_PROXIES}"
echo "TARGET_HOST: ${TARGET_HOST}"
echo "HTTP_PORT: ${HTTP_PORT}"
echo "HTTPS_PORT: ${HTTPS_PORT}"

# Execute the command passed to docker run
exec "$@"
