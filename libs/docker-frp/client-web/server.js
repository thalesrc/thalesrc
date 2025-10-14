const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const port = process.env.WEB_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Global variables to track FRP client process
let frpcProcess = null;
let frpcLogs = '';

// API Routes
app.post('/api/start', (req, res) => {
    if (frpcProcess) {
        return res.json({ success: false, error: 'Client is already running' });
    }

    const { config } = req.body;

    if (!config) {
        return res.json({ success: false, error: 'No configuration provided' });
    }

    try {
        // Write config to file
        fs.writeFileSync('/tmp/frpc.toml', config);

        // Start frpc process
        frpcProcess = spawn('frpc', ['-c', '/tmp/frpc.toml'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        frpcLogs = '';

        frpcProcess.stdout.on('data', (data) => {
            const log = data.toString();
            frpcLogs += log;
            console.log('FRP Client:', log);

            // Keep only last 10000 characters to prevent memory issues
            if (frpcLogs.length > 10000) {
                frpcLogs = frpcLogs.slice(-8000);
            }
        });

        frpcProcess.stderr.on('data', (data) => {
            const log = data.toString();
            frpcLogs += log;
            console.error('FRP Client Error:', log);

            if (frpcLogs.length > 10000) {
                frpcLogs = frpcLogs.slice(-8000);
            }
        });

        frpcProcess.on('close', (code) => {
            console.log(`FRP Client process exited with code ${code}`);
            frpcProcess = null;
            frpcLogs += `\nProcess exited with code ${code}\n`;
        });

        frpcProcess.on('error', (error) => {
            console.error('Failed to start FRP client:', error);
            frpcProcess = null;
            frpcLogs += `\nFailed to start: ${error.message}\n`;
        });

        res.json({ success: true, message: 'FRP Client started successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/stop', (req, res) => {
    if (!frpcProcess) {
        return res.json({ success: false, error: 'Client is not running' });
    }

    try {
        frpcProcess.kill('SIGTERM');

        setTimeout(() => {
            if (frpcProcess && !frpcProcess.killed) {
                frpcProcess.kill('SIGKILL');
            }
        }, 5000);

        frpcProcess = null;
        frpcLogs += '\nClient stopped by user\n';

        res.json({ success: true, message: 'FRP Client stopped successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        running: frpcProcess !== null,
        pid: frpcProcess ? frpcProcess.pid : null
    });
});

app.get('/api/logs', (req, res) => {
    res.json({ logs: frpcLogs });
});

app.post('/api/config/save', (req, res) => {
    const { config, filename } = req.body;

    if (!config) {
        return res.json({ success: false, error: 'No configuration provided' });
    }

    try {
        const configPath = `/app/configs/${filename || 'frpc.toml'}`;
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
        fs.writeFileSync(configPath, config);

        res.json({ success: true, message: 'Configuration saved successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/config/list', (req, res) => {
    try {
        const configDir = '/app/configs';

        if (!fs.existsSync(configDir)) {
            return res.json({ configs: [] });
        }

        const files = fs.readdirSync(configDir)
            .filter(file => file.endsWith('.toml'))
            .map(file => ({
                name: file,
                path: path.join(configDir, file),
                modified: fs.statSync(path.join(configDir, file)).mtime
            }));

        res.json({ configs: files });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Serve the main HTML file for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');

    if (frpcProcess) {
        frpcProcess.kill('SIGTERM');
    }

    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');

    if (frpcProcess) {
        frpcProcess.kill('SIGTERM');
    }

    process.exit(0);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`FRP Client Web Interface running on port ${port}`);
    console.log(`Access the interface at: http://localhost:${port}`);
});
