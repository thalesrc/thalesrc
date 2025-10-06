# @thalesrc/auto-proxy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Pulls](https://img.shields.io/docker/pulls/thalesrc/auto-proxy)](https://hub.docker.com/r/thalesrc/auto-proxy)
[![Build Status](https://img.shields.io/github/workflow/status/thalesrc/thalesrc/CI)](https://github.com/thalesrc/thalesrc/actions)

Docker-aware nginx reverse proxy with automatic SSL and service discovery. Perfect for development environments, microservices, and containerized applications.

## ✨ Features

- 🚀 **nginx + docker-gen Architecture**: Based on proven nginx-proxy design
- 🌐 **Automatic HTTPS**: Self-signed SSL certificates generated on-demand  
- 🔌 **gRPC Support**: Native HTTP/2 gRPC proxying with proper protocol handling
- 📝 **HOST_MAPPING**: Custom environment variable format for easy configuration
- 🏷️ **VIRTUAL_HOST**: Full compatibility with nginx-proxy conventions
- 🐳 **Docker Ready**: Drop-in replacement for nginx-proxy in development
- 🎯 **Local Development**: Optimized for development workflows and local domains
- ⚡ **High Performance**: nginx-powered with zero-downtime container discovery
- 📊 **Monitoring**: nginx access logs and container health status
- 🔄 **Hot Reload**: Automatic config updates when containers start/stop
- 🌐 **DNS Resolution**: Container network DNS resolution
- 💚 **Health Checks**: Built-in monitoring and status endpoints
- 🔒 **SSL Policies**: Configurable SSL security policies
- 🌍 **IPv6 Support**: Optional IPv6 support
- 🎛️ **Multi-Protocol**: HTTP/HTTPS/gRPC protocol support
- 🚪 **Multi-Port**: Configurable HTTP, HTTPS, and gRPC ports

## 🚀 Quick Start

### Method 1: HOST_MAPPING Format

```bash
# Start the auto-proxy
docker run --detach \
  --name thales-auto-proxy \
  --publish 80:80 \
  --publish 443:443 \
  --publish 50051:50051 \
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
```

### Method 2: Standard nginx-proxy VIRTUAL_HOST Format

```bash
docker run --detach \
  --name thales-auto-proxy \
  --publish 80:80 \
  --publish 443:443 \
  --volume /var/run/docker.sock:/tmp/docker.sock:ro \
  thalesrc/auto-proxy
```

Then start your services with `VIRTUAL_HOST`:

```bash
docker run --detach \
  --name your-app \
  --env VIRTUAL_HOST=myapp.local \
  your-app-image
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

volumes:
  auto_proxy_certs:

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
```

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 api.myapp.local
127.0.0.1 web.myapp.local  
127.0.0.1 admin.myapp.local
```

### Access Your Services

- `http://api.myapp.local/` - API service (HTTP)
- `https://api.myapp.local/` - API service (HTTPS with auto-generated SSL)
- `http://web.myapp.local/` - Web application (HTTP)  
- `https://web.myapp.local/` - Web application (HTTPS with auto-generated SSL)
- `api.myapp.local:50051` - API service gRPC (standard port)
- `api.myapp.local:9000` - API service gRPC (alternative port)

**🔐 SSL certificates are automatically generated** for all hostnames when containers start!

## ⚙️ Configuration

Thales Auto Proxy supports **two configuration methods**:

### Method 1: HOST_MAPPING Environment Variable

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

# Complex setup with multiple protocols
docker run -d --env HOST_MAPPING="HTTP:::admin.myapp.local:::4000,GRPC:::admin.myapp.local:::50052" my-admin-service
```

### Method 2: VIRTUAL_HOST (nginx-proxy Compatible)

Standard nginx-proxy format using container environment variables:

```bash
# Start a service with VIRTUAL_HOST
docker run --detach \
  --env VIRTUAL_HOST=myapp.local \
  --env VIRTUAL_PORT=3000 \
  my-app-image
```

### Environment Variables

#### For Service Containers:
| Variable | Description |
|----------|-------------|
| `HOST_MAPPING` | Custom format: `PROTOCOL:::HOSTNAME:::PORT,...` |
| `VIRTUAL_HOST` | nginx-proxy compatible hostname |
| `VIRTUAL_PORT` | nginx-proxy compatible port |

#### For Auto-Proxy Container:
| Variable | Default | Description |
|----------|---------|-------------|
| `TARGET_HOST` | `host.docker.internal` | Default target host for HOST_MAPPING services |
| `HTTP_PORTS` | `80,8080` | Comma-separated list of HTTP proxy ports |
| `HTTPS_PORTS` | `443` | Comma-separated list of HTTPS proxy ports |
| `GRPC_PORTS` | `50051,9000` | Comma-separated list of gRPC proxy ports |
| `DEFAULT_HOST` | `""` | Default host for unknown requests |
| `DEFAULT_ROOT` | `404` | Default response (404, 503, or redirect) |
| `ENABLE_IPV6` | `false` | Enable IPv6 support |
| `SSL_POLICY` | `Mozilla-Intermediate` | SSL configuration policy |
| `AUTO_SSL` | `true` | Enable automatic SSL certificate generation |
| `CERT_DIR` | `/etc/nginx/certs` | Directory to store SSL certificates |
| `CERT_VALIDITY_DAYS` | `365` | SSL certificate validity period in days |
| `SSL_KEY_SIZE` | `2048` | RSA key size for generated certificates |

### Port Configuration

```bash
# HTTP ports (comma-separated)
HTTP_PORTS="80,8080,3000"

# HTTPS ports (comma-separated) 
HTTPS_PORTS="443,8443"

# gRPC ports (comma-separated)
GRPC_PORTS="50051,9000,9001"
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
  -e VIRTUAL_HOST=grpc.local \
  -e VIRTUAL_GRPC_PORT=50051 \
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

## 📊 Monitoring and Logging

### Access Logs

nginx access logs are available at `/var/log/nginx/access.log`:

```bash
# View real-time logs
docker exec thales-auto-proxy tail -f /var/log/nginx/access.log

# Custom log format
NGINX_LOG_FORMAT='$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"'
```

### Container Health

Monitor container discovery and SSL certificate generation:

```bash
# View orchestrator logs
docker logs thales-auto-proxy

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
  --name thales-auto-proxy \
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

- [ ] Better documentation and examples
- [ ] Performance optimizations
- [ ] Enhanced logging and debugging

---

<div align="center">

**Made with ❤️ by [Thales](https://github.com/thalesrc)**

[Website](https://thalesrc.com) • [GitHub](https://github.com/thalesrc) • [NPM](https://www.npmjs.com/org/thalesrc)

</div>
