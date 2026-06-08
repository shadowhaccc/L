# 🌑 Shadow MD Bot v3.1

> **Powered by ShadowBaileys** - Modified WhatsApp Web API

## ✨ Features

### 🤖 Bot Features
- ✅ **Pair Code Login** (SubZero Style Web Dashboard)
- ✅ **QR Code Login**
- ✅ **Auto Channel Follow** - Auto follow channel on connect
- ✅ **Auto Status View** - Automatically view status updates
- ✅ **Auto Reply** - Smart auto replies
- ✅ **Anti Call** - Auto reject calls
- ✅ **Auto React** - React to commands
- ✅ **62+ Plugins** - Extensive plugin system
- ✅ **Web Dashboard** - Beautiful admin panel
- ✅ **Premium System** - Premium user support

### 🛠️ Commands
| Command | Description |
|---------|-------------|
| `.menu` | Show command menu |
| `.ping` | Check bot speed |
| `.info` | Bot information |
| `.vv` | View view-once media |
| `.sticker` | Create sticker |
| `.hack` | Fake hack effect |
| `.bomb` | Fake bomb countdown |
| `.spam` | Spam messages (owner) |
| `.ban` | Ban user (owner) |
| `.autostatus` | Toggle auto status |
| `.autoreply` | Toggle auto reply |
| `.anticalls` | Toggle anti call |
| `.autoreact` | Toggle auto react |

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/shadowhacc/shadow-md-bot
cd shadow-md-bot

# Install dependencies
npm install

# Start bot
npm start
```

## 📦 Dependencies

```json
{
  "@whiskeysockets/baileys": "^6.7.0",
  "express": "^4.18.0",
  "socket.io": "^4.7.0",
  "pino": "^7.0.0",
  "axios": "^1.6.0"
}
```

## ⚙️ Configuration

Edit `config.js`:

```javascript
module.exports = {
    botName: 'Shadow MD',
    version: 'v3.1',
    owner: 'your-number',
    prefix: '.',
    adminPassword: 'your-password',

    // Auto Channel Follow
    autoChannelFollow: true,
    channelLink: 'https://whatsapp.com/channel/0029Vb6iopUDzgTJuzPCk32V',

    // Features
    autoStatusView: true,
    autoReply: true,
    antiCall: true,
    autoReact: true
};
```

## 🌐 Web Dashboard

- **Pair Code**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin.html`
- **Default Password**: `shadowadmin2026`

## 🔌 ShadowBaileys

Modified Baileys library with:
- Custom branding
- Auto channel follow
- Enhanced notifications
- Pairing code support
- WebSocket integration

## 📱 Pair Code Flow

1. User visits web dashboard
2. Enters phone number with country code
3. Clicks "Request Pairing Code"
4. **WhatsApp notification arrives** "Enter code to link new device"
5. User enters code in WhatsApp
6. Bot connects automatically!

## 📢 Auto Channel Follow

When a user connects their WhatsApp:
- Bot automatically follows your channel
- No manual action needed
- Configurable in `config.js`

## 📝 License

MIT License - Shadow MD Team

## 👤 Owner

- **GitHub**: [shadowhacc](https://github.com/shadowhacc)
- **Channel**: [Join Here](https://whatsapp.com/channel/0029Vb6iopUDzgTJuzPCk32V)

---

<p align="center">
  <b>🌑 Shadow MD - The Ultimate WhatsApp Bot 🌑</b>
</p>
