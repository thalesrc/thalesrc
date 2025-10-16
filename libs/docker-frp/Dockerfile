# Multi-stage Dockerfile for FRP Server and Client

# Base stage with FRP binaries
FROM alpine:3.19 as frp-base
RUN apk add --no-cache curl tar

# Download and extract FRP with automatic architecture detection
ARG FRP_VERSION=0.65.0
ARG TARGETPLATFORM
ARG BUILDPLATFORM
WORKDIR /app

# Convert Docker platform to FRP architecture naming
RUN case "${TARGETPLATFORM}" in \
        "linux/amd64") FRP_ARCH="amd64" ;; \
        "linux/arm64") FRP_ARCH="arm64" ;; \
        "linux/arm/v7") FRP_ARCH="arm" ;; \
        "linux/arm/v6") FRP_ARCH="arm" ;; \
        "linux/386") FRP_ARCH="386" ;; \
        *) echo "Unsupported platform: ${TARGETPLATFORM}" && exit 1 ;; \
    esac && \
    echo "Building for platform: ${TARGETPLATFORM}, using FRP arch: ${FRP_ARCH}" && \
    curl -L https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_${FRP_ARCH}.tar.gz -o frp.tar.gz && \
    tar -xzf frp.tar.gz --strip-components=1 && \
    rm frp.tar.gz && \
    chmod +x frps frpc

# Server image
FROM alpine:3.19 as server
RUN apk add --no-cache bash gettext
COPY --from=frp-base /app/frps /usr/local/bin/frps
COPY server/ /app/
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/start-server.sh /app/entrypoint.sh
WORKDIR /app
EXPOSE 7000 7500
ENV MODE=server
ENTRYPOINT ["/app/entrypoint.sh"]

# Client image
FROM alpine:3.19 as client
RUN apk add --no-cache bash gettext
COPY --from=frp-base /app/frpc /usr/local/bin/frpc
COPY client/ /app/
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/start-client.sh /app/entrypoint.sh
WORKDIR /app
EXPOSE 7400
ENV MODE=client
ENTRYPOINT ["/app/entrypoint.sh"]

# Combined image (default)
FROM alpine:3.19 AS both
RUN apk add --no-cache bash curl

# Copy FRP binaries
COPY --from=frp-base /app/frps /usr/local/bin/frps
COPY --from=frp-base /app/frpc /usr/local/bin/frpc

# Copy all configuration files
COPY server/ /app/server/
COPY client/ /app/client/
COPY entrypoint.sh /app/entrypoint.sh

# Set executable permissions
RUN chmod +x /app/entrypoint.sh /app/server/start-server.sh /app/client/start-client.sh

WORKDIR /app
EXPOSE 7000 7500 7400

# Default environment variables
ENV MODE=server
ENV BIND_PORT=7000
ENV DASHBOARD_PORT=7500
ENV DASHBOARD_USER=admin
ENV ADMIN_PORT=7400
# Note: DASHBOARD_PASSWORD should be set at runtime for security

ENTRYPOINT ["/app/entrypoint.sh"]
