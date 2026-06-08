/**
 * 🌑 SHADOW MD BOT v3.1 🌑
 * Powered by ShadowBaileys
 * 
 * Features:
 * - Pair Code Login (SubZero Style)
 * - QR Code Login
 * - Auto Channel Follow
 * - Auto Status View
 * - Auto Reply
 * - Anti Call
 * - Auto React
 * - 62+ Plugins
 * - Web Dashboard
 * - Admin Panel
 */

const { ShadowBaileys } = require('./lib/shadowbaileys');
const config = require('./config');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// ==================== EXPRESS APP ====================
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static('web'));

// ==================== SHADOW BAILEYS INSTANCE ====================
const shadow = new ShadowBaileys({
    botName: config.botName,
    version: config.version,
    sessionName: config.sessionName,
    owner: config.owner,
    autoChannelFollow: config.autoChannelFollow,
    channelLink: config.channelLink,
    autoStatusView: config.autoStatusView,
    autoReply: config.autoReply,
    antiCall: config.antiCall,
    autoReact: config.autoReact,
    printQRInTerminal: true
});

// ==================== LOAD PLUGINS ====================
const pluginsDir = path.join(__dirname, 'plugins');
if (fs.existsSync(pluginsDir)) {
    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                if (plugin.name) {
                    shadow.registerPlugin(plugin.name, plugin);
                    console.log(`✅ Plugin loaded: ${plugin.name}`);
                }
            } catch (err) {
                console.log(`❌ Failed to load plugin ${file}:`, err.message);
            }
        }
    });
}

// ==================== EVENT HANDLERS ====================
shadow.on('connected', (info) => {
    console.log('✅ Connected:', info.name);
    io.emit('connected', info);
});

shadow.on('disconnected', () => {
    console.log('❌ Disconnected');
    io.emit('disconnected');
});

shadow.on('qr', (qr) => {
    console.log('📱 QR Code generated');
    io.emit('qr', qr);
});

shadow.on('pairing-code', (code) => {
    console.log('🔑 Pairing Code:', code);
    io.emit('pairing-code', code);
});

shadow.on('message', (msg) => {
    io.emit('new-message', {
        from: msg.from,
        pushName: msg.pushName,
        text: msg.text,
        timestamp: msg.timestamp
    });
});

shadow.on('channel-followed', (data) => {
    console.log('📢 Channel followed:', data.channel);
});

// ==================== API ROUTES ====================

// Get status
app.get('/api/status', (req, res) => {
    const status = shadow.getStatus();
    res.json({
        status: status.state,
        bot: status.user,
        uptime: status.uptime,
        messages: status.messages,
        config: {
            botName: config.botName,
            version: config.version,
            autoStatusView: config.autoStatusView,
            autoReply: config.autoReply,
            antiCall: config.antiCall,
            autoReact: config.autoReact,
            maintenance: config.maintenance
        }
    });
});

// Generate pairing code
app.post('/api/pair-code', async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number required' });
    }

    try {
        // Format phone number
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone;
        }

        await shadow.connectWithPairingCode(formattedPhone);

        // Wait for pairing code generation
        let attempts = 0;
        const checkCode = setInterval(() => {
            attempts++;
            if (shadow.pairingCode) {
                clearInterval(checkCode);
                res.json({
                    success: true,
                    code: shadow.pairingCode,
                    phone: formattedPhone,
                    message: 'Pairing code generated! Check your WhatsApp for notification.'
                });
            } else if (attempts > 30) {
                clearInterval(checkCode);
                res.status(500).json({ error: 'Timeout generating pairing code' });
            }
        }, 1000);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === config.adminPassword) {
        res.json({ success: true, token: 'shadow-admin-token-' + Date.now() });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Toggle features
app.post('/api/admin/:feature', (req, res) => {
    const { feature } = req.params;
    const { enabled } = req.body;

    const featureMap = {
        'autostatus': 'autoStatusView',
        'autoreply': 'autoReply',
        'anticalls': 'antiCall',
        'autoreact': 'autoReact',
        'maintenance': 'maintenance'
    };

    if (featureMap[feature]) {
        config[featureMap[feature]] = enabled;
        shadow.config[featureMap[feature]] = enabled;
        res.json({ [feature]: enabled });
    } else {
        res.status(400).json({ error: 'Unknown feature' });
    }
});

// Restart bot
app.post('/api/admin/restart', async (req, res) => {
    res.json({ message: 'Restarting...' });
    await shadow.restart();
});

// Get QR
app.get('/api/qr', (req, res) => {
    res.json({ 
        qr: shadow.qrCode, 
        state: shadow.state,
        pairingCode: shadow.pairingCode 
    });
});

// ==================== START SERVER ====================
server.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║     🌑 SHADOW MD BOT v3.1 🌑            ║
║                                          ║
║     Powered by ShadowBaileys             ║
║                                          ║
╠══════════════════════════════════════════╣
║  Port:     ${config.port.toString().padEnd(33)}║
║  Status:   Starting...                   ║
║  Owner:    ${config.owner.padEnd(33)}║
╚══════════════════════════════════════════╝
    `);
});

// Auto connect on startup
(async () => {
    try {
        await shadow.connect();
    } catch (err) {
        console.log('Connection error:', err.message);
    }
})();

module.exports = { shadow, app };
