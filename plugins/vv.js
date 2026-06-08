/**
 * Shadow MD - View Once Plugin
 * View view-once media
 */

module.exports = {
    name: 'vv',
    description: 'View view-once media',
    category: 'tools',
    usage: '.vv (reply to view-once message)',

    async run(sock, to, args, msg) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) {
                return await sock.sendMessage(to, { 
                    text: '❌ Reply to a view-once message!' 
                });
            }

            const type = Object.keys(quoted).find(k => 
                ['imageMessage', 'videoMessage', 'audioMessage'].includes(k)
            );

            if (!type) {
                return await sock.sendMessage(to, { 
                    text: '❌ No media found!' 
                });
            }

            // Remove view-once flag and resend
            const media = quoted[type];
            delete media.viewOnce;

            await sock.sendMessage(to, { [type.replace('Message', '')]: media });
        } catch (err) {
            await sock.sendMessage(to, { 
                text: '❌ Failed: ' + err.message 
            });
        }
    }
};
