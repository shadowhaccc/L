/**
 * Shadow MD - Auto React Plugin
 * Toggle auto react
 */

module.exports = {
    name: 'autoreact',
    description: 'Toggle auto react',
    category: 'settings',
    usage: '.autoreact',

    async run(sock, to, args, msg, config) {
        config.autoReact = !config.autoReact;
        await sock.sendMessage(to, { 
            text: `😀 Auto React: ${config.autoReact ? '✅ ON' : '❌ OFF'}` 
        });
    }
};
