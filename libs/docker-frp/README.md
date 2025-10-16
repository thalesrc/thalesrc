# Docker FRP - Fast Reverse Proxy Container

[![Docker Build](https://img.shields.io/badge/docker-ready-blue.svg)](https://hub.docker.com/r/thalesrc/docker-frp)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![FRP Version](https://img.shields.io/badge/frp-v0.65.0-brightgreen.svg)](https://github.com/fatedier/frp)

A comprehensive Docker container for [FRP (Fast Reverse Proxy)](https://github.com/fatedier/frp) with both server and client modes, featuring a modern web GUI for client configuration.

## ✨ Features

### 🖥️ Server Mode
- **Easy Setup**: One-command FRP server deployment
- **Web Dashboard**: Built-in management interface
- **Configurable**: Environment variable based configuration
- **Security**: Token-based authentication support
- **TLS Support**: Optional encrypted connections
- **Health Monitoring**: Built-in health checks and logging

### 💻 Client Mode
- **Admin UI**: Built-in FRP admin interface for configuration
- **Real-time Management**: Monitor and manage client connections
- **Configuration**: Environment variable and file-based configuration
- **Live Monitoring**: Real-time status and connection monitoring
- **Multiple Proxy Types**: Support for TCP, UDP, HTTP, HTTPS, STCP, XTCP

### 🏗️ Architecture
- **Multi-stage Build**: Optimized image sizes for different modes
- **Alpine Linux**: Minimal, secure base image
- **Latest FRP**: Always includes the latest stable FRP release (v0.65.0)
- **Multi-Platform**: Supports AMD64, ARM64, ARM v7, ARM v6, and 386 architectures
- **Cloud Native**: Kubernetes and Docker Compose ready

## 🚀 Quick Start

### Server Mode (Default)
```bash
# Basic server setup with authentication
docker run -p 7000:7000 -p 7500:7500 \
  -e DASHBOARD_USER=admin \
  -e DASHBOARD_PASSWORD=secure123 \
  -e AUTH_TOKEN=my_secure_token \
  thalesrc/docker-frp:latest

# Server without client authentication (open access)
docker run -p 7000:7000 -p 7500:7500 \
  -e DASHBOARD_USER=admin \
  -e DASHBOARD_PASSWORD=secure123 \
  thalesrc/docker-frp:latest

### 🌐 Access Points:**
- **Server Dashboard:** http://localhost:7500 (admin/admin)
- **Client Admin UI:** http://localhost:7400 (admin/admin)
```

### Client Mode with Admin UI
```bash
# Start client with authentication
docker run -p 7400:7400 \
  -e MODE=client \
  -e SERVER_ADDR=your.server.com \
  -e AUTH_TOKEN=my_secure_token \
  -e ADMIN_USER=admin \
  -e ADMIN_PASSWORD=secure123 \
  thalesrc/docker-frp:latest

# Start client without authentication (if server doesn't require auth)
docker run -p 7400:7400 \
  -e MODE=client \
  -e SERVER_ADDR=your.server.com \
  -e ADMIN_USER=admin \
  -e ADMIN_PASSWORD=secure123 \
  thalesrc/docker-frp:latest

# Access admin UI at: http://localhost:7400
```

## 📦 Installation

### Pre-built Images
```bash
# Latest version (both server and client)
docker pull thalesrc/docker-frp:latest

# Server-only image (smaller)
docker pull thalesrc/docker-frp:server

# Client-only image (with admin UI)
docker pull thalesrc/docker-frp:client
```

### Build from Source
```bash
# Clone this repository
git clone https://github.com/thalesrc/thalesrc.git
cd thalesrc/libs/docker-frp

# Build all variants
nx run docker-frp:build-all

# Or build specific variants
nx run docker-frp:build:server
nx run docker-frp:build:client
```

## 🛠️ Configuration

### Server Mode Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODE` | `server` | Container mode (server/client) |
| `BIND_PORT` | `7000` | FRP server bind port |
| `DASHBOARD_PORT` | `7500` | Web dashboard port |
| `DASHBOARD_USER` | `admin` | Dashboard username |
| `DASHBOARD_PASSWORD` | `admin` | Dashboard password |
| `AUTH_TOKEN` | *(optional)* | Client authentication token (if not set, no auth required) |
| `LOG_LEVEL` | `info` | Log level (trace/debug/info/warn/error) |
| `TLS_ENABLE` | `false` | Enable TLS encryption |
| `TLS_CERT_FILE` | `` | TLS certificate file path |
| `TLS_KEY_FILE` | `` | TLS private key file path |
| `VHOST_HTTP_PORT` | `8080` | HTTP virtual host port |
| `VHOST_HTTPS_PORT` | `8443` | HTTPS virtual host port |

### Client Mode Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODE` | `server` | Set to `client` for client mode |
| `SERVER_ADDR` | `x.x.x.x` | FRP server address |
| `SERVER_PORT` | `7000` | FRP server port |
| `AUTH_TOKEN` | *(optional)* | Authentication token (must match server if server has auth) |
| `ADMIN_PORT` | `7400` | FRP client admin UI port |
| `ADMIN_USER` | `admin` | Admin UI username |
| `ADMIN_PASSWORD` | `admin` | Admin UI password |
| `LOG_LEVEL` | `info` | Log level |
| `CONFIG_FILE` | `` | Custom configuration file path |

## 📋 Usage Examples

### Docker Compose

#### Complete Setup (Server + Client)
```yaml
version: '3.8'

services:
  frp-server:
    image: thalesrc/docker-frp:server
    ports:
      - "7000:7000"  # FRP server port
      - "7500:7500"  # Dashboard
      - "8080:8080"  # HTTP vhost
      - "6000-6010:6000-6010"  # Proxy ports
    environment:
      - MODE=server
      - DASHBOARD_USER=admin
      - DASHBOARD_PASSWORD=your_secure_password
      - AUTH_TOKEN=your_secret_token
    restart: unless-stopped

  frp-client:
    image: thalesrc/docker-frp:client
    ports:
      - "7400:7400"  # Admin UI
    environment:
      - MODE=client
      - SERVER_ADDR=frp-server
      - SERVER_PORT=7000
      - AUTH_TOKEN=your_secret_token
      - ADMIN_USER=admin
      - ADMIN_PASSWORD=secure123
    depends_on:
      - frp-server
    restart: unless-stopped
```

#### Server Only
```yaml
version: '3.8'

services:
  frp-server:
    image: thalesrc/docker-frp:server
    ports:
      - "7000:7000"
      - "7500:7500"
      - "6000-6100:6000-6100"  # Proxy port range
    environment:
      - MODE=server
      - BIND_PORT=7000
      - DASHBOARD_PORT=7500
      - DASHBOARD_USER=admin
      - DASHBOARD_PASSWORD=secure_password_123
      - AUTH_TOKEN=my_secure_token_456
      - LOG_LEVEL=info
      - VHOST_HTTP_PORT=8080
      - VHOST_HTTPS_PORT=8443
    volumes:
      - frp_logs:/app/logs
    restart: unless-stopped

volumes:
  frp_logs:
```

### Kubernetes Deployment

#### Server Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frp-server
  template:
    metadata:
      labels:
        app: frp-server
    spec:
      containers:
      - name: frp-server
        image: thalesrc/docker-frp:server
        ports:
        - containerPort: 7000
        - containerPort: 7500
        env:
        - name: MODE
          value: "server"
        - name: DASHBOARD_USER
          value: "admin"
        - name: DASHBOARD_PASSWORD
          valueFrom:
            secretKeyRef:
              name: frp-secret
              key: dashboard-password
        - name: AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: frp-secret
              key: auth-token
---
apiVersion: v1
kind: Service
metadata:
  name: frp-server-service
spec:
  selector:
    app: frp-server
  ports:
  - name: frp
    port: 7000
    targetPort: 7000
  - name: dashboard
    port: 7500
    targetPort: 7500
  type: LoadBalancer
```

### Advanced Examples

#### Server with TLS
```bash
docker run -d \
  --name frp-server \
  -p 7000:7000 \
  -p 7500:7500 \
  -v /path/to/certs:/certs:ro \
  -e MODE=server \
  -e TLS_ENABLE=true \
  -e TLS_CERT_FILE=/certs/server.crt \
  -e TLS_KEY_FILE=/certs/server.key \
  -e AUTH_TOKEN=super_secure_token \
  thalesrc/docker-frp:server
```

#### Client with Custom Config
```bash
# Create custom config
cat > frpc.toml << EOF
serverAddr = "your-server.example.com"
serverPort = 7000

[auth]
token = "your_token_here"

[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000

[[proxies]]
name = "web"
type = "http"
localPort = 8080
customDomains = ["web.example.com"]
EOF

# Run with custom config
docker run -d \
  --name frp-client \
  -p 3000:3000 \
  -v $(pwd)/frpc.toml:/app/custom-config.toml:ro \
  -e MODE=client \
  -e CONFIG_FILE=/app/custom-config.toml \
  thalesrc/docker-frp:client
```

## 🌐 Admin UI Usage

### Client Admin Interface

1. **Access the Admin UI**
   ```
   http://localhost:7400
   ```

2. **Login**
   - Use the configured admin username and password
   - Default: admin/admin (change in production)

3. **Monitor Client**
   - View real-time connection status
   - Monitor active proxies and tunnels
   - Check client statistics and logs

4. **Manage Proxies**
   - View configured proxy rules
   - Monitor proxy status and traffic
   - Access detailed connection information

### Proxy Types Supported

| Type | Description | Use Case |
|------|-------------|----------|
| **TCP** | TCP port forwarding | SSH, databases, general TCP services |
| **UDP** | UDP port forwarding | DNS, gaming, video streaming |
| **HTTP** | HTTP reverse proxy | Web applications with custom domains |
| **HTTPS** | HTTPS reverse proxy | Secure web applications |
| **STCP** | Secret TCP | Private services with shared key |
| **XTCP** | P2P TCP | Direct peer-to-peer connections |

## 🔧 Development

### Project Structure
```
libs/docker-frp/
├── Dockerfile              # Multi-stage Docker build
├── entrypoint.sh           # Main container entrypoint
├── project.json            # Nx project configuration
├── server/                 # Server mode files
│   ├── frps.toml.template  # Server config template
│   └── start-server.sh     # Server startup script
├── client/                 # Client mode files
│   ├── frpc.toml.template  # Client config template
│   └── start-client.sh     # Client startup script

└── README.md               # This file
```

### Building the Project

```bash
# Build all variants
nx run docker-frp:build-all

# Build specific variants
nx run docker-frp:build:server
nx run docker-frp:build:client

# Run in development
nx run docker-frp:run-server
nx run docker-frp:run-client
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

#### Architecture Compatibility
If you see the error `cannot execute binary file: Exec format error`, this means you're running the container on a different CPU architecture than expected.

**Solution:**
- **For Docker Hub/GHCR users**: Use the latest multi-platform image tags (v1.0.0+) which automatically select the correct architecture
- **For manual builds**: Ensure Docker BuildKit is enabled and use `--platform` flag:
```bash
# Build for your current platform
docker build --target client -t frp-client .

# Build for specific platform
docker build --platform linux/arm64 --target client -t frp-client .
```

**Supported Architectures:**
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (ARM 64-bit, Apple Silicon, Raspberry Pi 4+)
- `linux/arm/v7` (ARM 32-bit v7, Raspberry Pi 3+)
- `linux/arm/v6` (ARM 32-bit v6, Raspberry Pi Zero/1/2)
- `linux/386` (Intel/AMD 32-bit)

#### Server Mode
```bash
# Check server logs
docker logs container_name

# Test server connectivity
telnet your-server-ip 7000

# Access dashboard
curl http://your-server-ip:7500
```

#### Client Mode
```bash
# Check web GUI logs
docker logs container_name

# Access web interface
curl http://localhost:7400

# Check FRP client logs in admin UI
# Go to http://localhost:7400 and log in with admin credentials
```

#### Connection Issues
- Verify firewall settings on both server and client
- Ensure auth tokens match between server and client
- Check network connectivity between client and server
- Verify port mappings in Docker run commands

### Debug Mode
```bash
# Run with debug logging
docker run -e LOG_LEVEL=debug thalesrc/docker-frp

# Access container shell
docker exec -it container_name /bin/bash

# Check configuration files
cat /tmp/frps.toml  # Server config
cat /tmp/frpc.toml  # Client config
```

## 📊 Monitoring

### Health Checks
```bash
# Server health check
curl http://localhost:7500/api/serverinfo

# Client admin UI health check
curl -u admin:password http://localhost:7400/api/status

# Check client status
curl -u admin:password http://localhost:7400/api/config
```

### Metrics Integration
The container supports various monitoring solutions:

- **Prometheus**: Enable in FRP dashboard
- **Grafana**: Use FRP dashboard metrics
- **Docker Health**: Built-in health checks
- **Log Aggregation**: Structured JSON logging

## 🔒 Security

### Best Practices
- **Change Default Passwords**: Always set custom dashboard credentials
- **Use Strong Tokens**: Generate cryptographically secure auth tokens (optional but recommended)
- **Enable TLS**: Use encrypted connections in production
- **Network Isolation**: Run in isolated Docker networks
- **Regular Updates**: Keep container images updated
- **Monitor Access**: Review dashboard and proxy access logs

### Security Features
- Token-based authentication (optional)
- TLS encryption support
- Dashboard access control
- Request rate limiting
- IP whitelisting support
- Audit logging
- No-auth mode for development/trusted environments

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FRP Project](https://github.com/fatedier/frp) - The excellent reverse proxy tool
- [Alpine Linux](https://alpinelinux.org/) - Secure, lightweight base image


## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/thalesrc/thalesrc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/thalesrc/thalesrc/discussions)
- **Documentation**: [Project Wiki](https://github.com/thalesrc/thalesrc/wiki)

---

**Made with ❤️ by the Thalesrc Team**
