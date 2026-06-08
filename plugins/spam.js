/**
 * Shadow MD - Spam Plugin
 * Spam messages (Owner only)
 */

module.exports = {
    name: 'spam',
    description: 'Spam messages',
    category: 'admin',
    usage: '.spam [count] [message]',
    ownerOnly: true,

    async run(sock, to, args, msg) {
        const count = parseInt(args[0]) || 5;
        const text = args.slice(1).join(' ') || 'Shadow MD Spam!';
        const actualCount = Math.min(count, 50); // Limit to 50

        for (let i = 0; i < actualCount; i++) {
            await sock.sendMessage(to, { 
                text: `${text} (${i + 1}/${actualCount})` 
            });
            await new Promise(r => setTimeout(r, 500));
        }
    }
};
