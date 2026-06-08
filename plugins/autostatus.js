/**
 * Shadow MD - Auto Status Plugin
 * Toggle auto status view
 */

module.exports = {
    name: 'autostatus',
    description: 'Toggle auto status view',
    category: 'settings',
    usage: '.autostatus',

    async run(sock, to, args, msg, config) {
        config.autoStatusView = !config.autoStatusView;
        await sock.sendMessage(to, { 
            text: `👁️ Auto Status View: ${config.autoStatusView ? '✅ ON' : '❌ OFF'}` 
        });
    }
};
