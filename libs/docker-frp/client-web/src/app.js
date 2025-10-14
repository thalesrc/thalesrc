// FRP Client Web Configuration App
class FRPClientApp {
    constructor() {
        this.proxies = [];
        this.proxyCounter = 0;
        this.clientStatus = 'stopped';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
        this.addDefaultProxy();
        this.updateStatus();
    }

    bindEvents() {
        // Add proxy button
        document.getElementById('addProxyBtn').addEventListener('click', () => {
            this.addProxy();
        });

        // Generate configuration button
        document.getElementById('generateConfigBtn').addEventListener('click', () => {
            this.generateConfiguration();
        });

        // Start client button
        document.getElementById('startClientBtn').addEventListener('click', () => {
            this.startClient();
        });

        // Stop client button
        document.getElementById('stopClientBtn').addEventListener('click', () => {
            this.stopClient();
        });

        // Copy config button
        document.getElementById('copyConfigBtn').addEventListener('click', () => {
            this.copyConfig();
        });

        // Download config button
        document.getElementById('downloadConfigBtn').addEventListener('click', () => {
            this.downloadConfig();
        });

        // Auto-save on form changes
        document.addEventListener('input', () => {
            this.saveToStorage();
        });
    }

    addProxy(config = {}) {
        const proxyId = ++this.proxyCounter;
        const proxy = {
            id: proxyId,
            name: config.name || `proxy_${proxyId}`,
            type: config.type || 'tcp',
            localIP: config.localIP || '127.0.0.1',
            localPort: config.localPort || '22',
            remotePort: config.remotePort || '6000',
            customDomains: config.customDomains || '',
            subdomain: config.subdomain || '',
            locations: config.locations || '',
            httpUser: config.httpUser || '',
            httpPassword: config.httpPassword || ''
        };

        this.proxies.push(proxy);
        this.renderProxies();
        this.saveToStorage();
    }

    removeProxy(proxyId) {
        this.proxies = this.proxies.filter(p => p.id !== proxyId);
        this.renderProxies();
        this.saveToStorage();
    }

    addDefaultProxy() {
        if (this.proxies.length === 0) {
            this.addProxy({
                name: 'ssh',
                type: 'tcp',
                localIP: '127.0.0.1',
                localPort: '22',
                remotePort: '6000'
            });
        }
    }

    renderProxies() {
        const container = document.getElementById('proxiesContainer');
        container.innerHTML = '';

        this.proxies.forEach(proxy => {
            const proxyCard = document.createElement('div');
            proxyCard.className = 'proxy-card';
            proxyCard.innerHTML = `
                <h4>
                    Proxy: ${proxy.name}
                    <button class="remove-proxy" onclick="app.removeProxy(${proxy.id})">Remove</button>
                </h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" value="${proxy.name}" onchange="app.updateProxy(${proxy.id}, 'name', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Type:</label>
                        <select onchange="app.updateProxy(${proxy.id}, 'type', this.value); app.renderProxies();">
                            <option value="tcp" ${proxy.type === 'tcp' ? 'selected' : ''}>TCP</option>
                            <option value="udp" ${proxy.type === 'udp' ? 'selected' : ''}>UDP</option>
                            <option value="http" ${proxy.type === 'http' ? 'selected' : ''}>HTTP</option>
                            <option value="https" ${proxy.type === 'https' ? 'selected' : ''}>HTTPS</option>
                            <option value="stcp" ${proxy.type === 'stcp' ? 'selected' : ''}>STCP</option>
                            <option value="xtcp" ${proxy.type === 'xtcp' ? 'selected' : ''}>XTCP</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Local IP:</label>
                        <input type="text" value="${proxy.localIP}" onchange="app.updateProxy(${proxy.id}, 'localIP', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Local Port:</label>
                        <input type="number" value="${proxy.localPort}" onchange="app.updateProxy(${proxy.id}, 'localPort', this.value)">
                    </div>
                </div>
                ${this.renderProxySpecificFields(proxy)}
            `;
            container.appendChild(proxyCard);
        });
    }

    renderProxySpecificFields(proxy) {
        if (proxy.type === 'tcp' || proxy.type === 'udp') {
            return `
                <div class="form-group">
                    <label>Remote Port:</label>
                    <input type="number" value="${proxy.remotePort}" onchange="app.updateProxy(${proxy.id}, 'remotePort', this.value)">
                </div>
            `;
        } else if (proxy.type === 'http' || proxy.type === 'https') {
            return `
                <div class="form-row">
                    <div class="form-group">
                        <label>Custom Domains (comma-separated):</label>
                        <input type="text" value="${proxy.customDomains}" placeholder="example.com,test.com" onchange="app.updateProxy(${proxy.id}, 'customDomains', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Subdomain:</label>
                        <input type="text" value="${proxy.subdomain}" onchange="app.updateProxy(${proxy.id}, 'subdomain', this.value)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Locations (comma-separated):</label>
                        <input type="text" value="${proxy.locations}" placeholder="/api,/static" onchange="app.updateProxy(${proxy.id}, 'locations', this.value)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>HTTP User (optional):</label>
                        <input type="text" value="${proxy.httpUser}" onchange="app.updateProxy(${proxy.id}, 'httpUser', this.value)">
                    </div>
                    <div class="form-group">
                        <label>HTTP Password (optional):</label>
                        <input type="password" value="${proxy.httpPassword}" onchange="app.updateProxy(${proxy.id}, 'httpPassword', this.value)">
                    </div>
                </div>
            `;
        }
        return '';
    }

    updateProxy(id, field, value) {
        const proxy = this.proxies.find(p => p.id === id);
        if (proxy) {
            proxy[field] = value;
            this.saveToStorage();
        }
    }

    generateConfiguration() {
        const serverAddr = document.getElementById('serverAddr').value || 'x.x.x.x';
        const serverPort = document.getElementById('serverPort').value || '7000';
        const authToken = document.getElementById('authToken').value || '';
        const adminPort = document.getElementById('adminPort').value || '7400';
        const logLevel = document.getElementById('logLevel').value || 'info';
        const enableHeartbeat = document.getElementById('enableHeartbeat').checked;
        const enableTCP = document.getElementById('enableTCP').checked;

        let config = `# FRP Client Configuration
# Generated by FRP Client Web GUI

serverAddr = "${serverAddr}"
serverPort = ${serverPort}

`;

        if (authToken) {
            config += `[auth]
method = "token"
token = "${authToken}"

`;
        }

        config += `[log]
to = "./frpc.log"
level = "${logLevel}"
maxDays = 3

[webServer]
addr = "0.0.0.0"
port = ${adminPort}

[transport]
tcpMux = ${enableTCP}
heartbeatInterval = ${enableHeartbeat ? 30 : -1}
heartbeatTimeout = ${enableHeartbeat ? 90 : -1}

`;

        // Add proxies
        this.proxies.forEach(proxy => {
            config += `[[proxies]]
name = "${proxy.name}"
type = "${proxy.type}"
localIP = "${proxy.localIP}"
localPort = ${proxy.localPort}
`;

            if (proxy.type === 'tcp' || proxy.type === 'udp') {
                config += `remotePort = ${proxy.remotePort}\n`;
            } else if (proxy.type === 'http' || proxy.type === 'https') {
                if (proxy.customDomains) {
                    const domains = proxy.customDomains.split(',').map(d => `"${d.trim()}"`).join(', ');
                    config += `customDomains = [${domains}]\n`;
                }
                if (proxy.subdomain) {
                    config += `subdomain = "${proxy.subdomain}"\n`;
                }
                if (proxy.locations) {
                    const locations = proxy.locations.split(',').map(l => `"${l.trim()}"`).join(', ');
                    config += `locations = [${locations}]\n`;
                }
                if (proxy.httpUser && proxy.httpPassword) {
                    config += `httpUser = "${proxy.httpUser}"\n`;
                    config += `httpPassword = "${proxy.httpPassword}"\n`;
                }
            }
            config += '\n';
        });

        document.getElementById('configPreview').textContent = config;
        this.generatedConfig = config;
    }

    async startClient() {
        try {
            document.getElementById('startClientBtn').disabled = true;
            document.getElementById('startClientBtn').innerHTML = '<span class="spinner"></span>Starting...';

            const response = await fetch('/api/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    config: this.generatedConfig || ''
                })
            });

            const result = await response.json();

            if (result.success) {
                this.clientStatus = 'running';
                this.updateStatus();
                this.startLogPolling();
            } else {
                alert('Failed to start client: ' + result.error);
            }
        } catch (error) {
            alert('Error starting client: ' + error.message);
        } finally {
            document.getElementById('startClientBtn').disabled = false;
            document.getElementById('startClientBtn').textContent = 'Start FRP Client';
        }
    }

    async stopClient() {
        try {
            const response = await fetch('/api/stop', { method: 'POST' });
            const result = await response.json();

            if (result.success) {
                this.clientStatus = 'stopped';
                this.updateStatus();
                this.stopLogPolling();
            } else {
                alert('Failed to stop client: ' + result.error);
            }
        } catch (error) {
            alert('Error stopping client: ' + error.message);
        }
    }

    updateStatus() {
        const statusElement = document.getElementById('clientStatus');
        const startBtn = document.getElementById('startClientBtn');
        const stopBtn = document.getElementById('stopClientBtn');

        statusElement.textContent = this.clientStatus.charAt(0).toUpperCase() + this.clientStatus.slice(1);
        statusElement.className = `status-value status-${this.clientStatus === 'running' ? 'online' : 'offline'}`;

        startBtn.disabled = this.clientStatus === 'running';
        stopBtn.disabled = this.clientStatus === 'stopped';

        document.getElementById('activeProxies').textContent = this.clientStatus === 'running' ? this.proxies.length : 0;
    }

    startLogPolling() {
        this.logInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/logs');
                const result = await response.json();
                if (result.logs) {
                    document.getElementById('logContent').textContent = result.logs;
                }
            } catch (error) {
                console.error('Error fetching logs:', error);
            }
        }, 2000);
    }

    stopLogPolling() {
        if (this.logInterval) {
            clearInterval(this.logInterval);
            this.logInterval = null;
        }
    }

    copyConfig() {
        const config = document.getElementById('configPreview').textContent;
        navigator.clipboard.writeText(config).then(() => {
            const btn = document.getElementById('copyConfigBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    downloadConfig() {
        const config = document.getElementById('configPreview').textContent;
        const blob = new Blob([config], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'frpc.toml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    saveToStorage() {
        const data = {
            proxies: this.proxies,
            serverConfig: {
                serverAddr: document.getElementById('serverAddr')?.value,
                serverPort: document.getElementById('serverPort')?.value,
                authToken: document.getElementById('authToken')?.value,
                adminPort: document.getElementById('adminPort')?.value,
                logLevel: document.getElementById('logLevel')?.value,
                enableHeartbeat: document.getElementById('enableHeartbeat')?.checked,
                enableTCP: document.getElementById('enableTCP')?.checked
            }
        };
        localStorage.setItem('frpClientConfig', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('frpClientConfig');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.proxies = data.proxies || [];
                this.proxyCounter = Math.max(...this.proxies.map(p => p.id), 0);

                if (data.serverConfig) {
                    const config = data.serverConfig;
                    if (config.serverAddr) document.getElementById('serverAddr').value = config.serverAddr;
                    if (config.serverPort) document.getElementById('serverPort').value = config.serverPort;
                    if (config.authToken) document.getElementById('authToken').value = config.authToken;
                    if (config.adminPort) document.getElementById('adminPort').value = config.adminPort;
                    if (config.logLevel) document.getElementById('logLevel').value = config.logLevel;
                    if (config.enableHeartbeat !== undefined) document.getElementById('enableHeartbeat').checked = config.enableHeartbeat;
                    if (config.enableTCP !== undefined) document.getElementById('enableTCP').checked = config.enableTCP;
                }

                this.renderProxies();
            } catch (error) {
                console.error('Error loading from storage:', error);
            }
        }
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FRPClientApp();
});
