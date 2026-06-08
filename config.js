/**
 * Shadow MD Bot - Configuration
 * Easy to edit config file
 */

module.exports = {
    // Bot Info
    botName: 'Shadow MD',
    version: 'v3.1',
    owner: 'shadowhacc',
    prefix: '.',

    // Session
    sessionName: 'shadow-session',

    // Admin
    adminPassword: 'shadowadmin2026',

    // Server
    port: process.env.PORT || 3000,

    // Auto Features
    autoChannelFollow: true,
    channelLink: 'https://whatsapp.com/channel/0029Vb6iopUDzgTJuzPCk32V',

    autoStatusView: true,
    autoReply: true,
    antiCall: true,
    autoReact: true,

    // Pairing Code
    pairCodeEnabled: true,

    // Maintenance
    maintenance: false,

    // Premium Users (add numbers here)
    premiumUsers: [],

    // Blocked Users
    blockedUsers: [],

    // Custom Replies
    customReplies: {
        hi: '👋 Hello! I am Shadow MD Bot. Type *.menu* for commands.',
        hello: '👋 Hello! I am Shadow MD Bot. Type *.menu* for commands.',
        owner: '👤 Owner: shadowhacc\n🤖 Bot: Shadow MD v3.1'
    }
};
