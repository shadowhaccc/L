/**
 * Shadow MD - Hack Plugin
 * Fake hack effect for fun
 */

module.exports = {
    name: 'hack',
    description: 'Fake hack effect',
    category: 'fun',
    usage: '.hack [target]',

    async run(sock, to, args, msg) {
        const target = args.join(' ') || 'Target';

        const stages = [
            '💀 *SHADOW HACK INITIATED* 💀',
            '🔍 Scanning target...',
            '🔓 Bypassing firewall...',
            '📡 Accessing mainframe...',
            '💾 Downloading data...',
            '📱 Hacking camera...',
            '🔑 Cracking passwords...',
            '✅ *HACK COMPLETE*',
            '',
            `🎯 Target: ${target}`,
            `📊 Data stolen: ${Math.floor(Math.random() * 100)}TB`,
            `💰 Bank balance: $${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 99)}`,
            '',
            '🤡 _This is just a prank!_ 😄'
        ];

        for (const stage of stages) {
            if (stage) {
                await sock.sendMessage(to, { text: stage });
            }
            await new Promise(r => setTimeout(r, 800));
        }
    }
};
