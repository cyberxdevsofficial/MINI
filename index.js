const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { generatePairCode, getAllPairings } = require('./pair');

const BOT_NAME = 'ANUWH MD';
const FOOTER = 'POWERED BY ANUGA OFFICIAL';
const PREFIX = '.';

async function startBot(pairCode) {
  // The pairCode is provided by the user via web interface
  if (!pairCode) throw new Error('Pairing code required!');

  const sessionPath = path.join(__dirname, `session-${pairCode}`);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    printQRInTerminal: false, // QR removed
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, console.log)
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') console.log(`✅ Bot connected as ${BOT_NAME} with pairing code ${pairCode}`);
  });

  sock.ev.on('creds.update', saveCreds);

  const reply = async (from, message) => {
    await sock.sendMessage(from, { text: `*${BOT_NAME}*\n\n${message}\n\n_${FOOTER}_` });
  };

  // Example commands
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!text.startsWith(PREFIX)) return;
    const commandBody = text.slice(PREFIX.length).trim().toLowerCase();

    if (commandBody === 'ping') {
      const start = Date.now();
      await reply(from, 'Testing speed...');
      const end = Date.now();
      await reply(from, `🏓 Pong! Speed: *${end - start}ms*`);
    }

    if (commandBody === 'owner') {
      const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:Anuga Senithu De Silva
TEL;TYPE=CELL:+94710695082
END:VCARD`;
      await sock.sendMessage(from, {
        contacts: { displayName: "Owner", contacts: [{ vcard: vcfContent }] }
      });
      await reply(from, '✅ Owner contact sent!');
    }

    if (commandBody === 'menu') {
      await reply(from, `Bot Name: ${BOT_NAME}\nCommands:\n.ping\n.owner\n.menu\n`);
    }
  });

  return sock;
}

module.exports = startBot;        try {
          const info = await ytdl.getInfo(videoUrl);
          const link = ytdl.filterFormats(info.formats, 'audioandvideo')[0].url;
          await reply(from, `🎬 Video URL: ${link}`);
        } catch { await reply(from, '❌ Failed to fetch video.'); }
        break;

      case 'song':
        const songUrl = commandBody.split(' ')[1];
        try {
          const info = await ytdl.getInfo(songUrl);
          const link = ytdl.filterFormats(info.formats, 'audioonly')[0].url;
          await reply(from, `🎵 Song URL: ${link}`);
        } catch { await reply(from, '❌ Failed to fetch song.'); }
        break;

      case 'apk':
        await sendAPKFile(from);
        break;

      case 'movie':
        const name = commandBody.split(' ').slice(1).join(' ');
        const info = await getMovieInfo(name);
        if (info) await reply(from, info);
        else await reply(from, '❌ Movie not found');
        break;

      case 'menu':
        const menuMessage = `
*${BOT_NAME}*

Commands:
📌 .ping - Test bot speed
📌 .boom - Boom messages
📌 .video [url] - Download video
📌 .song [url] - Download song
📌 .apk - Get sample APK
📌 .movie [name] - Movie info
📌 .owner - Show owner contact
📌 .chr [link],[reaction] - React to channel message
📌 .menu - Show this menu
        `;
        await sock.sendMessage(from, {
          image: { url: 'https://i.postimg.cc/nX6ZH38b/botlogo.png' },
          caption: menuMessage
        });
        break;

      case 'owner':
        await sendOwnerVcf(from);
        await reply(from, `Owner Info:\nName: Anuga Senithu De Silva\nNumber: +94710695082\nCountry: Sri Lanka 🇱🇰`);
        break;

      case 'chr': {
        const q = msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || 
                  msg.message?.imageMessage?.caption || 
                  msg.message?.videoMessage?.caption || '';

        if (!q.includes(',')) {
            await sock.sendMessage(from, { 
                text: "❌ Please provide input like this:\n*.chr <link>,<reaction>*" 
            });
            break;
        }

        const link = q.split(",")[0].trim();
        const react = q.split(",")[1].trim();

        try {
            const channelId = link.split('/')[4];
            const messageId = link.split('/')[5];

            // Placeholder: adjust according to your bot API
            // const res = await sock.newsletterMetadata("invite", channelId);
            // const response = await sock.newsletterReactMessage(res.id, messageId, react);

            await sock.sendMessage(from, { text: `✅ Reacted with "${react}" successfully on ${link}!` });

        } catch (e) {
            console.log(e);
            await sock.sendMessage(from, { text: `❌ Error: ${e.message}` });
        }
        break;
      }

      default:
        await reply(from, '❌ Unknown command');
    }
  });

  return sock;
}

module.exports = startBot;        break;

      case 'movie':
        const name = commandBody.split(' ').slice(1).join(' ');
        const info = await getMovieInfo(name);
        if (info) await reply(from, info);
        else await reply(from, '❌ Movie not found');
        break;

      default:
        await reply(from, '❌ Unknown command');
    }
  });

  return sock;
}

module.exports = startBot;
