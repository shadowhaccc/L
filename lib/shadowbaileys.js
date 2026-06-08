/**
 * ShadowBaileys v6.7.0-shadow
 * Modified WhatsApp Web API for Shadow MD Bot
 * Based on @whiskeysockets/baileys
 */

const { 
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    delay,
    downloadContentFromMessage,
    generateWAMessageFromContent,
    proto
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const axios = require('axios');
const EventEmitter = require('events');

class ShadowBaileys extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            botName: options.botName || 'Shadow MD',
            version: options.version || 'v3.1',
            sessionName: options.sessionName || 'shadow-session',
            logger: options.logger || pino({ level: 'silent' }),
            printQRInTerminal: options.printQRInTerminal !== false,
            browser: options.browser || Browsers.macOS('Safari'),
            autoChannelFollow: options.autoChannelFollow !== false,
            channelLink: options.channelLink || '',
            autoStatusView: options.autoStatusView !== false,
            autoReply: options.autoReply !== false,
            antiCall: options.antiCall !== false,
            autoReact: options.autoReact !== false,
            ...options
        };

        this.sock = null;
        this.state = 'disconnected';
        this.qrCode = null;
        this.pairingCode = null;
        this.messageCount = 0;
        this.startTime = Date.now();
        this.blockedUsers = new Set();
        this.premiumUsers = new Set();
        this.plugins = new Map();

        // Initialize
        this._init();
    }

    async _init() {
        this.emit('init');
    }

    /**
     * Connect to WhatsApp with QR Code
     */
    async connect() {
        return this._connect(false);
    }

    /**
     * Connect to WhatsApp with Pairing Code
     * @param {string} phoneNumber - Phone number with country code
     */
    async connectWithPairingCode(phoneNumber) {
        return this._connect(true, phoneNumber);
    }

    async _connect(usePairingCode = false, phoneNumber = null) {
        const { state, saveCreds } = await useMultiFileAuthState(
            `./session/${this.config.sessionName}`
        );

        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            logger: this.config.logger,
            printQRInTerminal: this.config.printQRInTerminal && !usePairingCode,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, this.config.logger)
            },
            browser: this.config.browser,
            generateHighQualityLinkPreview: true,
            syncFullHistory: true,
            markOnlineOnConnect: true,
            keepAliveIntervalMs: 30000,
            ...(usePairingCode && phoneNumber ? {
                pairingCode: true,
                phoneNumber: phoneNumber
            } : {})
        });

        // Pairing code generation
        if (usePairingCode && phoneNumber && !this.sock.authState.creds.registered) {
            const code = await this.sock.requestPairingCode(phoneNumber);
            this.pairingCode = code;
            this.state = 'pairing';
            this.emit('pairing-code', code);

            // Send WhatsApp notification
            await this._sendPairingNotification(phoneNumber, code);
        }

        // Connection updates
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.qrCode = qr;
                this.state = 'qr';
                this.emit('qr', qr);
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                this.state = 'disconnected';
                this.emit('disconnected', lastDisconnect?.error);

                if (shouldReconnect) {
                    this.emit('reconnecting');
                    setTimeout(() => this._connect(usePairingCode, phoneNumber), 3000);
                }
            } else if (connection === 'open') {
                this.state = 'connected';
                this.qrCode = null;
                this.pairingCode = null;

                this.emit('connected', {
                    name: this.sock.user.name,
                    id: this.sock.user.id,
                    connectedAt: new Date().toISOString()
                });

                // Auto channel follow
                if (this.config.autoChannelFollow && this.config.channelLink) {
                    await this._autoChannelFollow();
                }

                // Send connected notification
                await this._sendConnectedNotification();
            }
        });

        // Save credentials
        this.sock.ev.on('creds.update', saveCreds);

        // Message handler
        this.sock.ev.on('messages.upsert', async (m) => {
            await this._handleMessages(m);
        });

        // Call handler
        this.sock.ev.on('call', async (call) => {
            if (this.config.antiCall) {
                await this._handleCalls(call);
            }
        });

        // Presence handler
        this.sock.ev.on('presence.update', (update) => {
            this.emit('presence', update);
        });

        return this.sock;
    }

    /**
     * Send WhatsApp notification when pairing code is generated
     */
    async _sendPairingNotification(phoneNumber, code) {
        try {
            // This sends a notification to the user's WhatsApp
            // The notification appears as "Enter code to link new device"
            const jid = phoneNumber + '@s.whatsapp.net';

            // The pairing code itself triggers the WhatsApp notification
            // No additional message needed - WhatsApp handles this automatically
            this.emit('notification', {
                type: 'pairing',
                phone: phoneNumber,
                code: code,
                message: 'Check your WhatsApp for linking notification'
            });
        } catch (err) {
            this.emit('error', err);
        }
    }

    /**
     * Auto follow channel on connect
     */
    async _autoChannelFollow() {
        try {
            const channelId = this.config.channelLink.split('/').pop();

            // Use Baileys newsletter feature to follow channel
            if (this.sock.newsletterFollow) {
                await this.sock.newsletterFollow(channelId);
            }

            this.emit('channel-followed', {
                channel: this.config.channelLink,
                success: true
            });

            console.log('✅ Auto Channel Followed:', this.config.channelLink);
        } catch (err) {
            this.emit('channel-follow-error', err);
            console.log('⚠️ Channel follow failed:', err.message);
        }
    }

    /**
     * Send connected notification to owner
     */
    async _sendConnectedNotification() {
        try {
            // Extract owner from config or use default
            const ownerJid = this.config.owner ? this.config.owner + '@s.whatsapp.net' : null;
            if (!ownerJid) return;

            await this.sock.sendMessage(ownerJid, {
                text: `🌑 *SHADOW MD BOT ACTIVATED* 🌑\n\n✅ Bot Status: *ONLINE*\n👤 User: ${this.sock.user.name}\n📱 Number: ${this.sock.user.id.split(':')[0]}\n⏰ Time: ${new Date().toLocaleString()}\n\n🤖 Type *.menu* for commands\n⚡ Powered by ShadowBaileys`
            });
        } catch (e) {
            // Silent fail
        }
    }

    /**
     * Handle incoming messages
     */
    async _handleMessages(m) {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        this.messageCount++;

        const messageData = {
            key: msg.key,
            from: msg.key.remoteJid,
            sender: msg.key.participant || msg.key.remoteJid,
            pushName: msg.pushName || 'User',
            message: msg.message,
            text: msg.message.conversation || msg.message.extendedTextMessage?.text || '',
            timestamp: msg.messageTimestamp,
            isGroup: msg.key.remoteJid.endsWith('@g.us')
        };

        this.emit('message', messageData);

        // Auto status view
        if (this.config.autoStatusView && msg.key.remoteJid === 'status@broadcast') {
            await this.sock.readMessages([msg.key]);
            this.emit('status-viewed', messageData);
        }

        // Auto reply
        if (this.config.autoReply && !messageData.isGroup) {
            // Simple auto reply logic
            const lowerText = messageData.text.toLowerCase();
            if (lowerText.includes('hi') || lowerText.includes('hello')) {
                await this.sendMessage(messageData.from, 
                    `👋 Hello ${messageData.pushName}! I'm ${this.config.botName}. Type *.menu* for commands.`
                );
            }
        }

        // Check for commands
        if (messageData.text.startsWith('.')) {
            await this._handleCommand(messageData);
        }
    }

    /**
     * Handle commands
     */
    async _handleCommand(msgData) {
        const args = msgData.text.slice(1).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        this.emit('command', { cmd, args, msg: msgData });

        // Auto react
        if (this.config.autoReact) {
            await this.sock.sendMessage(msgData.from, { 
                react: { text: '⚡', key: msgData.key } 
            });
        }

        // Built-in commands
        switch (cmd) {
            case 'menu':
                await this._sendMenu(msgData);
                break;
            case 'ping':
                await this.sendMessage(msgData.from, '⚡ *Pong!*');
                break;
            case 'info':
                await this._sendInfo(msgData);
                break;
        }

        // Execute plugin commands
        if (this.plugins.has(cmd)) {
            try {
                await this.plugins.get(cmd).run(this.sock, msgData.from, args, msgData);
            } catch (err) {
                this.emit('plugin-error', { cmd, error: err });
            }
        }
    }

    async _sendMenu(msgData) {
        const menu = `
🌑 *${this.config.botName}* 🌑
*Version:* ${this.config.version}

👋 *Hello ${msgData.pushName}!*

📋 *MAIN COMMANDS*
.menu - Show this menu
.ping - Check bot speed
.info - Bot information

👁️ *AUTO FEATURES*
.autostatus - Toggle auto status view
.autoreply - Toggle auto reply
.anticalls - Toggle anti call
.autoreact - Toggle auto react

💎 *Powered by ShadowBaileys*
`;
        await this.sendMessage(msgData.from, menu);
    }

    async _sendInfo(msgData) {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);

        const info = `
🌑 *${this.config.botName} INFO* 🌑

🤖 *Name:* ${this.config.botName}
📌 *Version:* ${this.config.version}
⏱️ *Uptime:* ${hours}h ${mins}m
📨 *Messages:* ${this.messageCount}
📊 *Status:* ${this.state.toUpperCase()}

💎 *Powered by ShadowBaileys*
`;
        await this.sendMessage(msgData.from, info);
    }

    /**
     * Handle incoming calls
     */
    async _handleCalls(calls) {
        for (const call of calls) {
            if (call.status === 'offer') {
                await this.sock.rejectCall(call.id, call.from);
                await this.sendMessage(call.from, 
                    '❌ *Shadow MD Auto-Reject*\n\nI do not accept calls. Please send a message instead.'
                );
                this.emit('call-rejected', call);
            }
        }
    }

    /**
     * Send message wrapper
     */
    async sendMessage(jid, content) {
        if (!this.sock) throw new Error('Not connected');
        return await this.sock.sendMessage(jid, content);
    }

    /**
     * Send text message
     */
    async sendText(jid, text, options = {}) {
        return await this.sendMessage(jid, { text, ...options });
    }

    /**
     * Send image
     */
    async sendImage(jid, image, caption = '') {
        return await this.sendMessage(jid, { image, caption });
    }

    /**
     * Send video
     */
    async sendVideo(jid, video, caption = '') {
        return await this.sendMessage(jid, { video, caption });
    }

    /**
     * Send sticker
     */
    async sendSticker(jid, sticker) {
        return await this.sendMessage(jid, { sticker });
    }

    /**
     * Send audio
     */
    async sendAudio(jid, audio, ptt = false) {
        return await this.sendMessage(jid, { audio, ptt });
    }

    /**
     * Send document
     */
    async sendDocument(jid, document, mimetype, fileName) {
        return await this.sendMessage(jid, { document, mimetype, fileName });
    }

    /**
     * Send button message
     */
    async sendButtons(jid, text, buttons) {
        const buttonMessage = {
            text,
            footer: this.config.botName,
            buttons: buttons.map((btn, i) => ({
                buttonId: btn.id || `btn_${i}`,
                buttonText: { displayText: btn.text },
                type: 1
            })),
            headerType: 1
        };
        return await this.sendMessage(jid, buttonMessage);
    }

    /**
     * Send list message
     */
    async sendList(jid, text, sections) {
        const listMessage = {
            text,
            footer: this.config.botName,
            title: 'Select an option',
            buttonText: 'Click here',
            sections
        };
        return await this.sendMessage(jid, listMessage);
    }

    /**
     * Send reaction
     */
    async react(jid, key, emoji) {
        return await this.sock.sendMessage(jid, { react: { text: emoji, key } });
    }

    /**
     * Download media from message
     */
    async downloadMedia(message, type) {
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    }

    /**
     * Get group metadata
     */
    async getGroupMetadata(jid) {
        return await this.sock.groupMetadata(jid);
    }

    /**
     * Get profile picture
     */
    async getProfilePicture(jid) {
        return await this.sock.profilePictureUrl(jid, 'image');
    }

    /**
     * Block user
     */
    async blockUser(jid) {
        await this.sock.updateBlockStatus(jid, 'block');
        this.blockedUsers.add(jid);
    }

    /**
     * Unblock user
     */
    async unblockUser(jid) {
        await this.sock.updateBlockStatus(jid, 'unblock');
        this.blockedUsers.delete(jid);
    }

    /**
     * Register plugin
     */
    registerPlugin(name, plugin) {
        this.plugins.set(name, plugin);
        this.emit('plugin-registered', name);
    }

    /**
     * Unregister plugin
     */
    unregisterPlugin(name) {
        this.plugins.delete(name);
        this.emit('plugin-unregistered', name);
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            state: this.state,
            user: this.sock?.user || null,
            uptime: Date.now() - this.startTime,
            messages: this.messageCount,
            config: this.config
        };
    }

    /**
     * Disconnect
     */
    async disconnect() {
        if (this.sock) {
            await this.sock.logout();
            this.state = 'disconnected';
            this.emit('disconnected');
        }
    }

    /**
     * Restart connection
     */
    async restart() {
        await this.disconnect();
        await delay(2000);
        return await this.connect();
    }
}

// Export
module.exports = { ShadowBaileys, delay, downloadContentFromMessage };
