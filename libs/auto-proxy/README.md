# @thalesrc/auto-proxy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Container Registry](https://img.shields.io/badge/ghcr.io-auto--proxy-blue)](https://github.com/thalesrc/thalesrc/pkgs/container/auto-proxy)
[![Build Status](https://img.shields.io/github/workflow/status/thalesrc/thalesrc/CI)](https://github.com/thalesrc/thalesrc/actions)

Docker-aware nginx reverse proxy with automatic SSL and service discovery. Perfect for development environments, microservices, and containerized applications.

## ✨ Features

- 🚀 **nginx + docker-gen Architecture**: Based on proven nginx-proxy design
- 🌐 **Automatic HTTPS**: Self-signed SSL certificates generated on-demand  
- 🔌 **gRPC Support**: Native HTTP/2 gRPC proxying with proper protocol handling
- 🗄️ **Database Support**: PostgreSQL, MySQL, Redis, and MongoDB TCP proxying
- 📝 **HOST_MAPPING**: Custom environment variable format for easy configuration
- 🎯 **STATIC_PROXIES**: Configure static proxies directly on auto-proxy container
- 🐳 **Docker Ready**: Lightweight reverse proxy for development environments
- 🎯 **Local Development**: Optimized for development workflows and local domains
- ⚡ **High Performance**: nginx-powered with zero-downtime container discovery
- 📊 **Monitoring**: nginx access logs and container health status
- 🔄 **Hot Reload**: Automatic config updates when containers start/stop
- 🌐 **DNS Resolution**: Container network DNS resolution
- 💚 **Health Checks**: Built-in monitoring and status endpoints
- 🔒 **SSL Policies**: Configurable SSL security policies
- 🌍 **IPv6 Support**: Optional IPv6 support
- 🎛️ **Multi-Protocol**: HTTP/HTTPS/gRPC/Database protocol support
- 🚪 **Multi-Port**: Configurable HTTP, HTTPS, gRPC, and database ports

## 🚀 Quick Start

### Usage

```bash
# Start the auto-proxy with all protocol support
docker run --detach \
  --name thalesrc-auto-proxy \
  --publish 80:80 \
  --publish 443:443 \
  --publish 50051:50051 \
  --publish 5432:5432 \
  --publish 3306:3306 \
  --publish 6379:6379 \
  --publish 27017:27017 \
  --volume /var/run/docker.sock:/tmp/docker.sock:ro \
  thalesrc/auto-proxy

# Start your services with HOST_MAPPING
docker run --detach \
  --name api-service \
  --env HOST_MAPPING="HTTP:::api.myapp.local:::3000,GRPC:::api.myapp.local:::50051" \
  your-api-service

docker run --detach \
  --name web-service \
  --env HOST_MAPPING="HTTP:::web.myapp.local:::8080" \
  your-web-service

# Start database services
docker run --detach \
  --name postgres-service \
  --env HOST_MAPPING="DATABASE:::db.myapp.local:::5432" \
  --env POSTGRES_DB=myapp \
  --env POSTGRES_USER=user \
  --env POSTGRES_PASSWORD=password \
  postgres:15

docker run --detach \
  --name redis-service \
  --env HOST_MAPPING="DATABASE:::cache.myapp.local:::6379" \
  redis:7-alpine
```



### Docker Compose Example

```yaml
version: '3.8'

services:
  auto-proxy:
    image: thalesrc/auto-proxy
    ports:
      - "80:80"          # HTTP port
      - "443:443"        # HTTPS port
      - "50051:50051"    # gRPC port
      - "5432:5432"      # Database port (PostgreSQL)
      - "3306:3306"      # Database port (MySQL)
      - "6379:6379"      # Database port (Redis)
      - "27017:27017"    # Database port (MongoDB)
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - auto_proxy_certs:/etc/nginx/certs
    networks:
      - app-network

  # Your services with HOST_MAPPING
  api-service:
    image: your-api-service
    environment:
      - HOST_MAPPING=HTTP:::api.myapp.local:::3000,GRPC:::api.myapp.local:::50051
    ports:
      - "3000:3000"  # HTTP
      - "50051:50051" # gRPC
    networks:
      - app-network

  web-service:
    image: your-web-service
    environment:
      - HOST_MAPPING=HTTP:::web.myapp.local:::8080
    ports:
      - "8080:80"
    networks:
      - app-network

  # Database services
  postgres:
    image: postgres:15
    environment:
      - HOST_MAPPING=DATABASE:::db.myapp.local:::5432
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    environment:
      - HOST_MAPPING=DATABASE:::cache.myapp.local:::6379
    networks:
      - app-network

  mysql:
    image: mysql:8
    environment:
      - HOST_MAPPING=MYSQL:::mysql.myapp.local:::3306
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=myapp
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

volumes:
  auto_proxy_certs:
  postgres_data:
  mysql_data:

networks:
  app-network:
    driver: bridge
```

### Hosts File Setup

Add these entries to your hosts file:

**Linux/Mac** (`/etc/hosts`):
```
127.0.0.1 api.myapp.local
127.0.0.1 web.myapp.local
127.0.0.1 admin.myapp.local
127.0.0.1 db.myapp.local
127.0.0.1 cache.myapp.local
127.0.0.1 mysql.myapp.local
```

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 api.myapp.local
127.0.0.1 web.myapp.local  
127.0.0.1 admin.myapp.local
127.0.0.1 db.myapp.local
127.0.0.1 cache.myapp.local
127.0.0.1 mysql.myapp.local
```

### Access Your Services

**Web Services:**
- `http://api.myapp.local/` - API service (HTTP)
- `https://api.myapp.local/` - API service (HTTPS with auto-generated SSL)
- `http://web.myapp.local/` - Web application (HTTP)  
- `https://web.myapp.local/` - Web application (HTTPS with auto-generated SSL)
- `api.myapp.local:50051` - API service gRPC (standard port)
- `api.myapp.local:9000` - API service gRPC (alternative port)

**Database Services:**
- `db.myapp.local:5432` - PostgreSQL database
- `cache.myapp.local:6379` - Redis cache
- `mysql.myapp.local:3306` - MySQL database
- Connect using standard database clients with the mapped hostnames

**🔐 SSL certificates are automatically generated** for all hostnames when containers start!

## ⚙️ Configuration

### HOST_MAPPING Environment Variable

Set the `HOST_MAPPING` environment variable **on your service containers** (not on auto-proxy). Format:

```
PROTOCOL:::HOSTNAME:::PORT,PROTOCOL:::HOSTNAME:::PORT,...
```

**Examples:**
```bash
# Single HTTP service
docker run -d --env HOST_MAPPING="HTTP:::api.myapp.local:::3000" my-api-service

# Multiple services from one container
docker run -d --env HOST_MAPPING="HTTP:::api.myapp.local:::3000,GRPC:::api.myapp.local:::50051" my-service

# Database services
docker run -d --env HOST_MAPPING="POSTGRESQL:::db.myapp.local:::5432" postgres:15
docker run -d --env HOST_MAPPING="REDIS:::cache.myapp.local:::6379" redis:7-alpine
docker run -d --env HOST_MAPPING="MYSQL:::mysql.myapp.local:::3306" mysql:8

# Complex setup with multiple protocols
docker run -d --env HOST_MAPPING="HTTP:::admin.myapp.local:::4000,GRPC:::admin.myapp.local:::50052" my-admin-service
```



### Environment Variables

#### For Service Containers:
| Variable | Description | Supported Protocols |
|----------|-------------|---------------------|
| `HOST_MAPPING` | Custom format: `PROTOCOL:::HOSTNAME:::PORT,...` | `HTTP`, `GRPC`, `DATABASE` |

#### For Auto-Proxy Container:
| Variable | Default | Description |
|----------|---------|-------------|
| `STATIC_PROXIES` | `""` | Static proxy mappings (see below) |
| `TARGET_HOST` | `host.docker.internal` | Default target host for HOST_MAPPING services |
| `HTTP_PORTS` | `80,8080` | Comma-separated list of HTTP proxy ports |
| `HTTPS_PORTS` | `443` | Comma-separated list of HTTPS proxy ports |
| `GRPC_PORTS` | `50051,9000` | Comma-separated list of gRPC proxy ports |
| `DATABASE_PORTS` | `5432,3306,6379,27017` | Comma-separated list of database proxy ports (PostgreSQL, MySQL, Redis, MongoDB) |
| `DEFAULT_HOST` | `""` | Default host for unknown requests |
| `DEFAULT_ROOT` | `404` | Default response (404, 503, or redirect) |
| `ENABLE_IPV6` | `false` | Enable IPv6 support |
| `SSL_POLICY` | `Mozilla-Intermediate` | SSL configuration policy |
| `AUTO_SSL` | `true` | Enable automatic SSL certificate generation |
| `CERT_DIR` | `/etc/nginx/certs` | Directory to store SSL certificates |
| `CERT_VALIDITY_DAYS` | `365` | SSL certificate validity period in days |
| `SSL_KEY_SIZE` | `2048` | RSA key size for generated certificates |

### STATIC_PROXIES Configuration

The `STATIC_PROXIES` environment variable allows you to configure static proxy mappings directly on the auto-proxy container. This is useful when you want to proxy to external services or when you don't want to modify the service containers.

**Format:**
```
STATIC_PROXIES=PROTOCOL:::HOSTNAME:::PROXY_PORT=>TARGET_HOST:::TARGET_PORT,PROTOCOL:::HOSTNAME:::PROXY_PORT=>TARGET_HOST:::TARGET_PORT,...
```

**Supported Protocols:**
- `HTTP` - HTTP/HTTPS web services
- `GRPC` - gRPC services
- `DATABASE` - Database services (PostgreSQL, MySQL, Redis, MongoDB, etc.)

**Examples:**

```bash
# Single static HTTP proxy
STATIC_PROXIES="HTTP:::api.external.local:::443=>api.example.com:::3000"

# Multiple static proxies
STATIC_PROXIES="HTTP:::api.external.local:::443=>api.example.com:::3000,DATABASE:::db.external.local:::6379=>redis.example.com:::6379"

# Mix of HTTP, gRPC, and Database proxies
STATIC_PROXIES="HTTP:::web.external.local:::443=>192.168.1.100:::8080,GRPC:::grpc.external.local:::50051=>grpc.example.com:::50051,DATABASE:::cache.external.local:::6379=>redis.example.com:::6379"
```

**Docker Compose Example:**

```yaml
version: '3.8'

services:
  auto-proxy:
    image: thalesrc/auto-proxy
    ports:
      - "80:80"
      - "443:443"
      - "50051:50051"
      - "6379:6379"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - auto_proxy_certs:/etc/nginx/certs
    environment:
      # Static proxies to external services
      - STATIC_PROXIES=HTTP:::api.external.local:::443=>api.example.com:::3000,DATABASE:::cache.external.local:::6379=>redis.example.com:::6379
    networks:
      - app-network

volumes:
  auto_proxy_certs:

networks:
  app-network:
    driver: bridge
```

**Notes:**
- The arrow (`=>`) separates the proxy configuration from the target configuration
- SSL certificates are automatically generated for HTTP and gRPC static proxies
- Database proxies use TCP passthrough at Layer 4
- Static proxies work alongside dynamic container discovery via `HOST_MAPPING`
- You can proxy to any reachable host: localhost, host.docker.internal, external IPs, or domain names

### Port Configuration

```bash
# HTTP ports (comma-separated)
HTTP_PORTS="80,8080,3000"

# HTTPS ports (comma-separated) 
HTTPS_PORTS="443,8443"

# gRPC ports (comma-separated)
GRPC_PORTS="50051,9000,9001"

# Database ports (comma-separated)
DATABASE_PORTS="5432,3306,6379,27017"
```

### SSL Configuration

Control SSL certificate generation and policies:

```bash
# Disable automatic SSL (development only)
AUTO_SSL=false

# Custom certificate directory
CERT_DIR="/custom/cert/path"

# Certificate validity period
CERT_VALIDITY_DAYS=730

# SSL policy (Mozilla-Modern, Mozilla-Intermediate, Mozilla-Old)
SSL_POLICY="Mozilla-Modern"
```

## 🏗️ Use Cases

### 1. Microservices Development

Perfect for local development of microservices with automatic service discovery:

```yaml
# docker-compose.yml
version: '3.8'
services:
  auto-proxy:
    image: thalesrc/auto-proxy
    ports: ["80:80", "443:443", "50051:50051"]
    volumes: ["/var/run/docker.sock:/tmp/docker.sock:ro"]

  user-service:
    image: user-service
    environment:
      - HOST_MAPPING=HTTP:::api.dev.local:::3000,GRPC:::api.dev.local:::50051
    ports: ["3000:3000", "50051:50051"]
    
  frontend:
    image: react-app
    environment:
      - HOST_MAPPING=HTTP:::web.dev.local:::8080
    ports: ["8080:80"]
```

### 2. gRPC Development

Native support for gRPC services with HTTP/2:

```bash
# Start gRPC services
docker run -d --name grpc-service \
  --env HOST_MAPPING="GRPC:::grpc.local:::50051" \
  my-grpc-service

# Test with grpcurl
grpcurl -plaintext grpc.local:50051 list
```

### 3. Multi-tenant Applications

Route different domains to different services:

```bash
# Tenant 1 service
docker run -d --env HOST_MAPPING="HTTP:::tenant1.app.local:::3001" tenant1-service

# Tenant 2 service  
docker run -d --env HOST_MAPPING="HTTP:::tenant2.app.local:::3002" tenant2-service

# Admin service
docker run -d --env HOST_MAPPING="HTTP:::admin.app.local:::4000" admin-service
```

### 4. API Gateway Pattern

Central gateway for all API services:

```bash
# Users API
docker run -d --env HOST_MAPPING="HTTP:::users.api.local:::3001" users-api

# Orders API
docker run -d --env HOST_MAPPING="HTTP:::orders.api.local:::3002" orders-api

# Payments API
docker run -d --env HOST_MAPPING="HTTP:::payments.api.local:::3003" payments-api
```

### 5. Static Proxies to External Services

Proxy to services outside of Docker or on remote servers using `STATIC_PROXIES`:

```yaml
# docker-compose.yml
version: '3.8'
services:
  auto-proxy:
    image: thalesrc/auto-proxy
    ports: ["80:80", "443:443", "6379:6379"]
    volumes: ["/var/run/docker.sock:/tmp/docker.sock:ro"]
    environment:
      # Proxy to external API
      - STATIC_PROXIES=HTTP:::api.external.local:::443=>api.example.com:::3000,DATABASE:::cache.external.local:::6379=>redis.company.com:::6379
    networks:
      - app-network

  # Local service that needs to access external API
  backend:
    image: my-backend-service
    environment:
      - API_URL=https://api.external.local  # Proxied through auto-proxy
      - REDIS_URL=redis://cache.external.local:6379  # Proxied through auto-proxy
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Access the services:**
```bash
# From your host machine
curl https://api.external.local  # Routes to api.example.com:3000
redis-cli -h cache.external.local -p 6379  # Routes to redis.company.com:6379
```

**Benefits:**
- Consistent access patterns for both local and external services
- SSL termination for external HTTP services
- Single point of configuration
- Easy to switch between local and remote services

### 6. Real-time Applications

WebSocket, SSE, and WebRTC applications:

```yaml
# docker-compose.yml
version: '3.8'
services:
  auto-proxy:
    image: thalesrc/auto-proxy
    ports: ["80:80", "443:443"]
    volumes: ["/var/run/docker.sock:/tmp/docker.sock:ro"]

  # WebSocket chat server
  chat-ws:
    image: my-chat-server
    environment:
      - HOST_MAPPING=HTTP:::chat.app.local:::3000

  # SSE notification server
  notifications:
    image: my-notification-server
    environment:
      - HOST_MAPPING=HTTP:::notify.app.local:::4000
      
  # WebRTC signaling server
  webrtc-signaling:
    image: my-webrtc-server
    environment:
      - HOST_MAPPING=HTTP:::webrtc.app.local:::5000

  # Real-time dashboard
  dashboard:
    image: my-dashboard
    environment:
      - HOST_MAPPING=HTTP:::dashboard.app.local:::8080
```

### 7. Database Development Environment

Unified database access through the proxy:

```yaml
# docker-compose.yml
version: '3.8'
services:
  auto-proxy:
    image: thalesrc/auto-proxy
    ports: ["80:80", "443:443", "5432:5432", "3306:3306", "6379:6379"]
    volumes: ["/var/run/docker.sock:/tmp/docker.sock:ro"]

  # PostgreSQL cluster
  postgres-primary:
    image: postgres:15
    environment:
      - HOST_MAPPING=POSTGRESQL:::db-primary.local:::5432
      - POSTGRES_DB=myapp
    volumes: [postgres_primary:/var/lib/postgresql/data]
    
  postgres-replica:
    image: postgres:15
    environment:
      - HOST_MAPPING=POSTGRESQL:::db-replica.local:::5432
      - POSTGRES_DB=myapp
    volumes: [postgres_replica:/var/lib/postgresql/data]

  # Redis cluster
  redis-master:
    image: redis:7-alpine
    environment:
      - HOST_MAPPING=REDIS:::cache-master.local:::6379
      
  redis-slave:
    image: redis:7-alpine
    environment:
      - HOST_MAPPING=REDIS:::cache-slave.local:::6379

  # MySQL
  mysql:
    image: mysql:8
    environment:
      - HOST_MAPPING=MYSQL:::mysql.local:::3306
      - MYSQL_ROOT_PASSWORD=password
    volumes: [mysql_data:/var/lib/mysql]
```

**Connect to databases:**
```bash
# PostgreSQL
psql -h db-primary.local -p 5432 -U user -d myapp

# MySQL
mysql -h mysql.local -P 3306 -u root -p

# Redis
redis-cli -h cache-master.local -p 6379

# MongoDB
mongosh mongodb://mongo.local:27017/myapp
```

## 🔧 Advanced Configuration

### Custom nginx Configuration

Mount custom nginx configurations:

```bash
docker run -d \
  -v /path/to/custom.conf:/etc/nginx/conf.d/custom.conf:ro \
  thalesrc/auto-proxy
```

### Health Monitoring

Built-in health endpoints:

- `http://localhost/health` - Proxy health status
- `http://localhost/nginx_status` - nginx status (if enabled)

### Performance Tuning

```bash
# Increase worker processes
NGINX_WORKER_PROCESSES=4

# Increase worker connections
NGINX_WORKER_CONNECTIONS=2048

# Enable gzip compression
NGINX_GZIP=on
```

### Security Configuration

```bash
# Enable HSTS
NGINX_HSTS=true

# Custom SSL ciphers
SSL_CIPHERS="ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256"

# Disable weak protocols
SSL_PROTOCOLS="TLSv1.2 TLSv1.3"
```

### Database Configuration

The auto-proxy provides **TCP passthrough** for database connections. Database protocols are proxied at Layer 4 (TCP level), allowing your database servers to handle their own authentication and encryption.

```bash
# Start auto-proxy with database ports
docker run -d \
  --name thales-auto-proxy \
  --publish 5432:5432 \    # PostgreSQL
  --publish 3306:3306 \    # MySQL
  --publish 6379:6379 \    # Redis
  --publish 27017:27017 \  # MongoDB
  --volume /var/run/docker.sock:/tmp/docker.sock:ro \
  thalesrc/auto-proxy

# Start database services
docker run -d \
  --name postgres \
  --env HOST_MAPPING="DATABASE:::db.myapp.local:::5432" \
  --env POSTGRES_DB=myapp \
  --env POSTGRES_USER=myuser \
  --env POSTGRES_PASSWORD=mypass \
  postgres:15

docker run -d \
  --name mysql \
  --env HOST_MAPPING="DATABASE:::mysql.myapp.local:::3306" \
  --env MYSQL_ROOT_PASSWORD=rootpass \
  --env MYSQL_DATABASE=myapp \
  mysql:8

docker run -d \
  --name redis \
  --env HOST_MAPPING="DATABASE:::cache.myapp.local:::6379" \
  redis:7-alpine
```

**Database Connection Examples:**

```bash
# PostgreSQL
psql -h db.myapp.local -p 5432 -U myuser -d myapp

# MySQL
mysql -h mysql.myapp.local -P 3306 -u root -p

# Redis
redis-cli -h cache.myapp.local -p 6379

# MongoDB
mongosh mongodb://mongo.myapp.local:27017/myapp
```

**Note**: SSL/TLS support is handled by your database servers directly. Configure SSL in your database containers as needed for your security requirements.

### Real-time Communication Support

The auto-proxy provides comprehensive support for real-time web technologies:

#### WebSocket Support

WebSockets are automatically supported for all HTTP services. No additional configuration needed!

```bash
# Start WebSocket server
docker run -d \
  --name websocket-server \
  --env HOST_MAPPING="HTTP:::ws.myapp.local:::8080" \
  my-websocket-app

# Connect via JavaScript
const ws = new WebSocket('ws://ws.myapp.local/socket');
const wss = new WebSocket('wss://ws.myapp.local/socket'); // SSL
```

#### Server-Sent Events (SSE) Support

SSE is optimized with disabled buffering for real-time event streaming:

```bash
# Start SSE server
docker run -d \
  --name sse-server \
  --env HOST_MAPPING="HTTP:::events.myapp.local:::3000" \
  my-sse-app

# Connect via JavaScript
const eventSource = new EventSource('https://events.myapp.local/stream');
eventSource.onmessage = function(event) {
    console.log('Received:', event.data);
};
```

#### WebRTC Support

WebRTC signaling servers work seamlessly through HTTP/WebSocket proxying:

```bash
# Start WebRTC signaling server
docker run -d \
  --name webrtc-signaling \
  --env HOST_MAPPING="HTTP:::webrtc.myapp.local:::4000" \
  my-webrtc-signaling-server

# Your WebRTC app can use standard STUN/TURN servers
# ICE candidates and media traffic work with the proxy
```

#### Example: Real-time Chat Application

```yaml
version: '3.8'
services:
  auto-proxy:
    image: thalesrc/auto-proxy
    ports: ["80:80", "443:443"]
    volumes: ["/var/run/docker.sock:/tmp/docker.sock:ro"]

  chat-backend:
    image: my-chat-backend
    environment:
      - HOST_MAPPING=HTTP:::chat.myapp.local:::3000
    # WebSocket connections to /ws endpoint

  chat-frontend:
    image: my-chat-frontend  
    environment:
      - HOST_MAPPING=HTTP:::app.myapp.local:::8080
    # Serves the chat UI

  notification-service:
    image: my-notification-service
    environment:
      - HOST_MAPPING=HTTP:::notifications.myapp.local:::4000
    # Server-Sent Events for real-time notifications
```

**Connection Examples:**

```javascript
// WebSocket connection
const chatWs = new WebSocket('wss://chat.myapp.local/ws');

// SSE connection
const notifications = new EventSource('https://notifications.myapp.local/events');

// WebRTC signaling through WebSocket
const signalingWs = new WebSocket('wss://chat.myapp.local/webrtc-signaling');
```

## 📊 Monitoring and Logging

### Access Logs

nginx access logs are available at `/var/log/nginx/access.log`:

```bash
# View real-time logs
docker exec thalesrc-auto-proxy tail -f /var/log/nginx/access.log

# Custom log format
NGINX_LOG_FORMAT='$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"'
```

### Container Health

Monitor container discovery and SSL certificate generation:

```bash
# View orchestrator logs
docker logs thalesrc-auto-proxy

# Enable debug logging
DEBUG=true
```

### Metrics Integration

Ready for monitoring integration:

```yaml
# Add monitoring sidecar
monitoring:
  image: nginx-exporter
  command: ["-nginx.scrape-uri", "http://auto-proxy:8080/nginx_status"]
```

## 🐳 Building from Source

```bash
# Clone the repository
git clone https://github.com/thalesrc/thalesrc.git
cd thalesrc/libs/auto-proxy

# Build the Docker image
docker build -t thalesrc/auto-proxy .

# Run locally
docker run -d \
  --name thalesrc-auto-proxy \
  -p 80:80 -p 443:443 \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  thalesrc/auto-proxy
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy)
- Built with [docker-gen](https://github.com/nginx-proxy/docker-gen)
- Uses [nginx](https://nginx.org/) as the core proxy engine

## 🆘 Support

- 📖 [Documentation](https://github.com/thalesrc/thalesrc/tree/main/libs/auto-proxy)
- 🐛 [Bug Reports](https://github.com/thalesrc/thalesrc/issues)
- 💬 [Discussions](https://github.com/thalesrc/thalesrc/discussions)
- 📧 [Email Support](mailto:hello@thalesrc.com)

## 🗺️ Roadmap

- [x] Database protocol support (PostgreSQL, MySQL, Redis, MongoDB)
- [x] Layer 4 TCP proxying with nginx stream module
- [ ] Better documentation and examples
- [ ] Performance optimizations for database connections
- [ ] Enhanced logging and debugging
- [ ] Database connection pooling support
- [ ] SSL/TLS support for database connections

---

<div align="center">

**Made with ❤️ by [Thalesrc](https://github.com/thalesrc)**

[Website](https://thalesrc.com) • [GitHub](https://github.com/thalesrc) • [NPM](https://www.npmjs.com/org/thalesrc)

</div>
