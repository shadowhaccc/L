/**
 * Shadow MD - Anti Calls Plugin
 * Toggle anti call
 */

module.exports = {
    name: 'anticalls',
    description: 'Toggle anti call',
    category: 'settings',
    usage: '.anticalls',

    async run(sock, to, args, msg, config) {
        config.antiCall = !config.antiCall;
        await sock.sendMessage(to, { 
            text: `📵 Anti Call: ${config.antiCall ? '✅ ON' : '❌ OFF'}` 
        });
    }
};
