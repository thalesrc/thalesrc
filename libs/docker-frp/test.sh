#!/bin/bash
# Docker FRP Test Suite
# Tests all container functionality including builds, startup, and volume persistence

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_TAG="${TEST_TAG:-test/docker-frp}"
CLEANUP_ON_SUCCESS="${CLEANUP_ON_SUCCESS:-true}"
VERBOSE="${VERBOSE:-false}"

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_test() {
    echo -e "${BLUE}🧪 $1${NC}"
}

# Cleanup function
cleanup() {
    local exit_code=$?
    log_info "Cleaning up test resources..."

    # Stop and remove test containers
    docker stop frp-server-test frp-client-test frp-test-server frp-volume-test 2>/dev/null || true
    docker rm frp-server-test frp-client-test frp-test-server frp-volume-test 2>/dev/null || true

    # Remove test configs directory
    rm -rf ./test-configs 2>/dev/null || true

    # Remove test images if cleanup is enabled
    if [ "$CLEANUP_ON_SUCCESS" = "true" ] && [ $exit_code -eq 0 ]; then
        log_info "Removing test images..."
        docker rmi "${TEST_TAG}:latest" "${TEST_TAG}:server" "${TEST_TAG}:client" 2>/dev/null || true
    fi

    if [ $exit_code -eq 0 ]; then
        log_success "All tests completed successfully!"
    else
        log_error "Tests failed with exit code $exit_code"
    fi

    exit $exit_code
}

# Set up cleanup trap
trap cleanup EXIT

# Helper function to show container logs if verbose
show_logs_if_verbose() {
    local container_name=$1
    if [ "$VERBOSE" = "true" ]; then
        echo "📋 $container_name logs:"
        docker logs "$container_name" 2>&1 || echo "Could not get logs"
        echo ""
    fi
}

# Test Docker builds
test_builds() {
    log_test "Testing Docker builds..."

    log_info "Building combined image..."
    docker build -t "${TEST_TAG}:latest" --target both .

    log_info "Building server image..."
    docker build -t "${TEST_TAG}:server" --target server .

    log_info "Building client image..."
    docker build -t "${TEST_TAG}:client" --target client .

    log_success "All Docker builds completed successfully"
}

# Test server container functionality
test_server_container() {
    log_test "Testing server container startup..."

    docker run -d --name frp-server-test \
        -e MODE=server \
        -e BIND_PORT=7000 \
        -e DASHBOARD_PORT=7500 \
        -e DASHBOARD_USER=admin \
        -e DASHBOARD_PASSWORD=testpass \
        "${TEST_TAG}:server"

    sleep 5

    show_logs_if_verbose frp-server-test

    # Check container status
    if ! docker ps -q -f name=frp-server-test | grep -q .; then
        log_error "Server container is not running"
        docker logs frp-server-test 2>&1 || true
        return 1
    fi

    # Validate that server started correctly by checking for expected log messages
    if docker logs frp-server-test 2>&1 | grep -q "frps started successfully"; then
        log_success "Server container started and FRP server is running"
    else
        log_error "Server container failed to start FRP server properly"
        docker logs frp-server-test 2>&1 || true
        return 1
    fi

    # Check if dashboard is accessible
    if docker logs frp-server-test 2>&1 | grep -q "dashboard listen on 0.0.0.0:7500"; then
        log_success "Server dashboard is available"
    else
        log_warning "Server dashboard may not be available"
    fi

    # Check VHost ports
    if docker logs frp-server-test 2>&1 | grep -q "http service listen on 0.0.0.0:8080"; then
        log_success "VHost HTTP port (8080) is available"
    else
        log_warning "VHost HTTP port may not be available"
    fi

    docker stop frp-server-test
    docker rm frp-server-test
}

# Test client container functionality
test_client_container() {
    log_test "Testing client container startup..."

    # Start a server container first for client testing
    log_info "Starting test server for client connection..."
    docker run -d --name frp-test-server \
        -e MODE=server \
        -e BIND_PORT=7000 \
        -e DASHBOARD_PORT=7500 \
        -e DASHBOARD_USER=admin \
        -e DASHBOARD_PASSWORD=testpass \
        "${TEST_TAG}:server"

    # Get server container IP
    SERVER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' frp-test-server)
    log_info "Server IP: $SERVER_IP"

    # Wait for server to be ready
    sleep 3

    # Run client container
    docker run -d --name frp-client-test \
        -e MODE=client \
        -e SERVER_ADDR="$SERVER_IP" \
        -e SERVER_PORT=7000 \
        -e ADMIN_PORT=7400 \
        -e ADMIN_USER=admin \
        -e ADMIN_PASSWORD=testpass \
        "${TEST_TAG}:client"

    sleep 8

    show_logs_if_verbose frp-client-test

    # Check if client container started properly by looking for admin UI message
    if docker logs frp-client-test 2>&1 | grep -q "admin server listen on 0.0.0.0:7400"; then
        log_success "Client container started correctly (admin UI available)"
    else
        log_error "Client container failed to start properly"
        docker logs frp-client-test 2>&1 || true
        return 1
    fi

    # Check if client attempted connection
    if docker logs frp-client-test 2>&1 | grep -q "try to connect to server"; then
        log_success "Client attempted server connection"
    else
        log_warning "Client may not have attempted server connection"
    fi

    # Clean up containers
    docker rm frp-client-test 2>/dev/null || true
    docker stop frp-test-server 2>/dev/null || true
    docker rm frp-test-server 2>/dev/null || true
}

# Test volume persistence functionality
test_volume_persistence() {
    log_test "Testing volume persistence..."

    # Create a test directory and run container with volume
    mkdir -p ./test-configs
    docker run --rm -d --name frp-volume-test \
        -v "$(pwd)/test-configs:/app/configs" \
        -e MODE=server \
        -e DASHBOARD_PASSWORD=volume123 \
        "${TEST_TAG}:server"

    sleep 5

    show_logs_if_verbose frp-volume-test

    # Check if config was generated and persisted
    if [ -f "./test-configs/frps.toml" ]; then
        log_success "Volume persistence working - config file created"

        # Verify config contains expected values
        if grep -q "password = \"volume123\"" ./test-configs/frps.toml; then
            log_success "Configuration templating working correctly"
        else
            log_error "Configuration templating failed"
            echo "Expected password = \"volume123\" in config file:"
            cat ./test-configs/frps.toml
            return 1
        fi

        # Test that existing config is used on restart
        docker stop frp-volume-test

        # Start again with different password - should use existing config
        docker run --rm -d --name frp-volume-test \
            -v "$(pwd)/test-configs:/app/configs" \
            -e MODE=server \
            -e DASHBOARD_PASSWORD=different456 \
            "${TEST_TAG}:server"

        sleep 3

        # Check logs for "Using existing configuration" message
        if docker logs frp-volume-test 2>&1 | grep -q "Using existing configuration"; then
            log_success "Existing configuration priority working correctly"
        else
            log_warning "May not be using existing configuration (check logs manually)"
        fi

        # Verify config still has original password
        if grep -q "password = \"volume123\"" ./test-configs/frps.toml && ! grep -q "password = \"different456\"" ./test-configs/frps.toml; then
            log_success "Configuration persistence working - original values preserved"
        else
            log_error "Configuration persistence failed - values were overwritten"
            cat ./test-configs/frps.toml
            return 1
        fi

    else
        log_error "Volume persistence failed - no config file created"
        docker logs frp-volume-test 2>&1 || true
        return 1
    fi

    # Clean up volume test
    docker stop frp-volume-test 2>/dev/null || true
    rm -rf ./test-configs
}

# Test help functionality
test_help_functionality() {
    log_test "Testing help functionality..."

    # Test help flag
    if docker run --rm "${TEST_TAG}:latest" --help | grep -q "Docker FRP - Fast Reverse Proxy Container"; then
        log_success "Help functionality working"
    else
        log_error "Help functionality not working"
        return 1
    fi
}

# Main test execution
main() {
    echo "🚀 Docker FRP Test Suite"
    echo "========================"
    echo "Test Tag: ${TEST_TAG}"
    echo "Cleanup: ${CLEANUP_ON_SUCCESS}"
    echo "Verbose: ${VERBOSE}"
    echo ""

    # Run all tests
    test_builds
    test_server_container
    test_client_container
    test_volume_persistence
    test_help_functionality

    log_success "All tests passed! 🎉"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    exit 1
fi

# Run main function
main "$@"
