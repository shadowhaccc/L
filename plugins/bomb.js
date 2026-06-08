/**
 * Shadow MD - Bomb Plugin
 * Fake bomb countdown
 */

module.exports = {
    name: 'bomb',
    description: 'Fake bomb countdown',
    category: 'fun',
    usage: '.bomb',

    async run(sock, to, args, msg) {
        const countdown = [
            { text: '💣 *BOMB PLANTED* 💣', delay: 1000 },
            { text: '💣 3...', delay: 1000 },
            { text: '💣💣 2...', delay: 1000 },
            { text: '💣💣💣 1...', delay: 1000 },
            { text: '💥💥💥 *BOOM!* 💥💥💥', delay: 500 },
            { text: '🤡 _Just kidding! Everyone is safe_ 😄', delay: 0 }
        ];

        for (const item of countdown) {
            await sock.sendMessage(to, { text: item.text });
            if (item.delay) {
                await new Promise(r => setTimeout(r, item.delay));
            }
        }
    }
};
