# Thales Auto Proxy - Docker-aware nginx reverse proxy with automatic SSL and service discovery
FROM nginx:1.25-alpine

LABEL maintainer="Thales <hello@thalesrc.com>"
LABEL version="1.0.0"
LABEL description="Docker-aware nginx reverse proxy with automatic SSL and service discovery"
LABEL org.opencontainers.image.source="https://github.com/thalesrc/thalesrc"
LABEL org.opencontainers.image.title="Thales Auto Proxy"
LABEL org.opencontainers.image.description="Perfect for development environments, microservices, and containerized applications"

# Install required packages including Docker CLI
RUN apk add --no-cache \
    bash \
    curl \
    openssl \
    ca-certificates \
    wget \
    docker-cli

# Download and install docker-gen
ENV DOCKER_GEN_VERSION=0.10.7
RUN wget --quiet https://github.com/nginx-proxy/docker-gen/releases/download/$DOCKER_GEN_VERSION/docker-gen-alpine-linux-amd64-$DOCKER_GEN_VERSION.tar.gz \
    && tar -C /usr/local/bin -xvzf docker-gen-alpine-linux-amd64-$DOCKER_GEN_VERSION.tar.gz \
    && rm /docker-gen-alpine-linux-amd64-$DOCKER_GEN_VERSION.tar.gz

# Copy application files
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.tmpl /app/nginx.tmpl
COPY nginx-stream.tmpl /app/nginx-stream.tmpl
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY start.sh /app/start.sh
COPY orchestrator.sh /app/orchestrator.sh
COPY generate-certs.sh /app/generate-certs.sh
COPY README.md /app/README.md

# Make scripts executable
RUN chmod +x /app/docker-entrypoint.sh /app/start.sh /app/orchestrator.sh /app/generate-certs.sh

# Create required directories and set permissions
RUN mkdir -p /etc/nginx/conf.d \
    && mkdir -p /etc/nginx/stream.d \
    && mkdir -p /etc/nginx/vhost.d \
    && mkdir -p /etc/nginx/certs \
    && mkdir -p /etc/nginx/dhparam \
    && mkdir -p /var/cache/nginx \
    && mkdir -p /var/run \
    && mkdir -p /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run \
    && chown -R nginx:nginx /etc/nginx/certs \
    && chown -R nginx:nginx /etc/nginx/dhparam \
    && chown -R nginx:nginx /usr/share/nginx/html

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Create default nginx configuration for initial startup
RUN echo 'server { listen 80 default_server; listen [::]:80 default_server; server_name _; location / { return 503; } location /health { return 200 "healthy\n"; add_header Content-Type text/plain; } }' > /etc/nginx/conf.d/default.conf

# Set working directory
WORKDIR /app

# Expose standard HTTP, HTTPS, gRPC, and database ports
EXPOSE 80 8080 443 50051 9000 9001 9002 5432 3306 6379 27017

# Set default environment variables
ENV DOCKER_HOST=unix:///tmp/docker.sock
ENV HOST_MAPPING=""
ENV TARGET_HOST="host.docker.internal"
ENV HTTP_PORTS="80,8080"
ENV HTTPS_PORTS="443"
ENV GRPC_PORTS="50051,9000"
ENV POSTGRESQL_PORTS="5432"
ENV MYSQL_PORTS="3306"
ENV REDIS_PORTS="6379"
ENV MONGODB_PORTS="27017"
ENV DEFAULT_ROOT="404"
ENV ENABLE_IPV6="false"
ENV SSL_POLICY="Mozilla-Intermediate"
ENV DHPARAM_BITS="2048"
ENV CERT_DIR="/etc/nginx/certs"
ENV CERT_VALIDITY_DAYS="365"
ENV AUTO_SSL="true"
ENV SSL_KEY_SIZE="2048"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Set entrypoint and default command
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["/app/start.sh"]
