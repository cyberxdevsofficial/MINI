const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { generatePairCode } = require('./pair');
const fs = require('fs');
const path = require('path');

const BOT_NAME = 'ANUWH MD';
const FOOTER = 'POWERED BY ANUGA OFFICIAL';
const PREFIX = '.';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        printQRInTerminal: false, // QR removed, using number pairing
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, console.log) }
    });

    sock.ev.on('creds.update', saveCreds);

    const reply = async (from, message) => {
        await sock.sendMessage(from, { text: `*${BOT_NAME}*\n\n${message}\n\n_${FOOTER}_` });
    };

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!text.startsWith(PREFIX)) return;

        const commandBody = text.slice(PREFIX.length).trim().toLowerCase();

        // PING command
        if (commandBody === 'ping') {
            const start = Date.now();
            await reply(from, 'Testing speed...');
            const end = Date.now();
            await reply(from, `🏓 Pong! Speed: *${end - start}ms*`);
        }

        // BOOM command
        if (commandBody.startsWith('boom')) {
            const count = parseInt(commandBody.split(' ')[1]) || 5;
            for (let i = 0; i < count; i++) await reply(from, `💥 Boom! ${i + 1}`);
        }

        // OWNER command
        if (commandBody === 'owner') {
            const vcfContent = `
BEGIN:VCARD
VERSION:3.0
FN:Anuga Senithu De Silva
TEL;TYPE=CELL:+94710695082
ADR;TYPE=HOME:;;Sri Lanka;;;;
END:VCARD
            `;
            await sock.sendMessage(from, { contacts: { displayName: "Anuga Senithu De Silva", contacts: [{ vcard: vcfContent }] } });
            await reply(from, '✅ Owner contact sent!');
        }

        // MENU command
        if (commandBody === 'menu') {
            await reply(from, `
🛠 ${BOT_NAME} Commands:

.ping - Test bot speed
.boom [n] - Send boom messages
.owner - Get owner contact
.menu - Show this menu
`);
        }

        // CHR command placeholder
        if (commandBody.startsWith('chr')) {
            await reply(from, 'CHR command executed (custom implementation).');
        }
    });

    return sock;
}

module.exports = startBot;
