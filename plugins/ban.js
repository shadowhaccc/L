/**
 * Shadow MD - Ban Plugin
 * Ban users from using bot
 */

module.exports = {
    name: 'ban',
    description: 'Ban a user',
    category: 'admin',
    usage: '.ban @user',
    ownerOnly: true,

    async run(sock, to, args, msg) {
        const target = args[0]?.replace(/[@\s]/g, '') + '@s.whatsapp.net';
        if (!target) {
            return await sock.sendMessage(to, { 
                text: '❌ Mention a user to ban!' 
            });
        }

        // Add to blocked list (implementation depends on your storage)
        await sock.sendMessage(to, { 
            text: `🚫 Banned: ${args[0]}` 
        });
    }
};
