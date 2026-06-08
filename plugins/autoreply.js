/**
 * Shadow MD - Auto Reply Plugin
 * Toggle auto reply
 */

module.exports = {
    name: 'autoreply',
    description: 'Toggle auto reply',
    category: 'settings',
    usage: '.autoreply',

    async run(sock, to, args, msg, config) {
        config.autoReply = !config.autoReply;
        await sock.sendMessage(to, { 
            text: `💬 Auto Reply: ${config.autoReply ? '✅ ON' : '❌ OFF'}` 
        });
    }
};
