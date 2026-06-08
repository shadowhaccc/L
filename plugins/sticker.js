/**
 * Shadow MD - Sticker Plugin
 * Create stickers from images
 */

module.exports = {
    name: 'sticker',
    description: 'Create sticker from image',
    category: 'tools',
    usage: '.sticker (reply to image)',

    async run(sock, to, args, msg) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(to, { 
                    text: '❌ Reply to an image with .sticker' 
                });
            }

            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            await sock.sendMessage(to, { 
                sticker: buffer,
                mimetype: 'image/webp'
            });
        } catch (err) {
            await sock.sendMessage(to, { 
                text: '❌ Failed to create sticker: ' + err.message 
            });
        }
    }
};
