# Multi-stage Dockerfile for FRP Server and Client
ARG BUILD_MODE=both

# Base stage with FRP binaries
FROM alpine:3.19 as frp-base
RUN apk add --no-cache curl tar

# Download and extract FRP
ARG FRP_VERSION=0.65.0
RUN mkdir -p /app && cd /app && \
    curl -L https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz -o frp.tar.gz && \
    tar -xzf frp.tar.gz --strip-components=1 && \
    rm frp.tar.gz && \
    chmod +x frps frpc

# Node.js build stage for client web app
FROM alpine:3.19 as web-build
RUN apk add --no-cache nodejs npm
WORKDIR /app

# Copy web app source
COPY client-web/ ./

# Install dependencies and build
RUN npm ci && npm run build

# Server-only image
FROM alpine:3.19 as server
RUN apk add --no-cache bash curl

# Copy FRP server binary
COPY --from=frp-base /app/frps /usr/local/bin/frps

# Copy server configuration
COPY server/ /app/server/
COPY entrypoint.sh /app/entrypoint.sh

# Set executable permissions
RUN chmod +x /app/entrypoint.sh

WORKDIR /app
EXPOSE 7000 7500

ENV MODE=server
ENV BIND_PORT=7000
ENV DASHBOARD_PORT=7500
ENV DASHBOARD_USER=admin
ENV DASHBOARD_PASSWORD=admin

ENTRYPOINT ["/app/entrypoint.sh"]

# Client-only image
FROM alpine:3.19 as client
RUN apk add --no-cache bash curl nodejs npm

# Copy FRP client binary
COPY --from=frp-base /app/frpc /usr/local/bin/frpc

# Copy web app built files
COPY --from=web-build /app/dist /app/client-web/

# Copy client configuration
COPY client/ /app/client/
COPY entrypoint.sh /app/entrypoint.sh

# Set executable permissions
RUN chmod +x /app/entrypoint.sh

WORKDIR /app
EXPOSE 3000

ENV MODE=client
ENV WEB_PORT=3000

ENTRYPOINT ["/app/entrypoint.sh"]

# Combined image (default)
FROM alpine:3.19 as both
RUN apk add --no-cache bash curl nodejs npm

# Copy FRP binaries
COPY --from=frp-base /app/frps /usr/local/bin/frps
COPY --from=frp-base /app/frpc /usr/local/bin/frpc

# Copy web app built files
COPY --from=web-build /app/dist /app/client-web/

# Copy all configuration files
COPY server/ /app/server/
COPY client/ /app/client/
COPY entrypoint.sh /app/entrypoint.sh

# Set executable permissions
RUN chmod +x /app/entrypoint.sh

WORKDIR /app
EXPOSE 7000 7500 3000

# Default environment variables
ENV MODE=server
ENV BIND_PORT=7000
ENV DASHBOARD_PORT=7500
ENV DASHBOARD_USER=admin
ENV DASHBOARD_PASSWORD=admin
ENV WEB_PORT=3000

ENTRYPOINT ["/app/entrypoint.sh"]

# Final stage selection based on BUILD_MODE
FROM ${BUILD_MODE} as final
