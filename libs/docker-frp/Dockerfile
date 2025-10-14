# Multi-stage Dockerfile for FRP Server and Client
ARG BUILD_MODE=both

# Base stage with FRP binaries
FROM alpine:3.19 as frp-base
RUN apk add --no-cache curl=8.5.0-r0 tar=1.35-r2

# Download and extract FRP
ARG FRP_VERSION=0.65.0
WORKDIR /app
RUN curl -L https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz -o frp.tar.gz && \
    tar -xzf frp.tar.gz --strip-components=1 && \
    rm frp.tar.gz && \
    chmod +x frps frpc

# Node.js build stage for client web app
FROM alpine:3.19 as web-build
RUN apk add --no-cache nodejs=20.12.2-r0 npm=10.2.5-r0
WORKDIR /app

# Copy web app source
COPY client-web/ ./

# Install dependencies and build
RUN npm ci && npm run build

# Server image
FROM alpine:3.19 as server
COPY --from=frp-base /usr/local/bin/frps /usr/local/bin/frps
COPY server/ /app/
WORKDIR /app
EXPOSE 7000 7500
CMD ["./start-server.sh"]

# Client image
FROM alpine:3.19 as client
RUN apk add --no-cache nodejs=20.12.2-r0 npm=10.2.5-r0
COPY --from=frp-base /usr/local/bin/frpc /usr/local/bin/frpc
COPY --from=web-build /app/client-web/dist /app/web
COPY --from=web-build /app/client-web/package.json /app/web/
COPY --from=web-build /app/client-web/server.js /app/web/
COPY client/ /app/
WORKDIR /app

# Combined image (default)
FROM alpine:3.19 as both
RUN apk add --no-cache bash=5.2.21-r0 curl=8.5.0-r0 nodejs=20.12.2-r0 npm=10.2.5-r0

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
