const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BOT_NAME = 'ANUWH MD';
const FOOTER = 'POWERED BY ANUGA OFFICIAL';
const PREFIX = '.';
const PAIR_FILE = './pairings.json';

// Ensure pairings file exists
if (!fs.existsSync(PAIR_FILE)) fs.writeFileSync(PAIR_FILE, JSON.stringify([]));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, console.log)
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'open') console.log('✅ Bot connected as', BOT_NAME);
  });

  sock.ev.on('creds.update', saveCreds);

  const reply = async (from, message) => {
    await sock.sendMessage(from, { text: `*${BOT_NAME}*\n\n${message}\n\n_${FOOTER}_` });
  };

  const sendAPKFile = async (from) => {
    const apkPath = path.join(__dirname, 'sample.apk');
    if (!fs.existsSync(apkPath)) return await reply(from, '❌ APK not found');
    const apkBuffer = fs.readFileSync(apkPath);
    await sock.sendMessage(from, {
      document: apkBuffer,
      mimetype: 'application/vnd.android.package-archive',
      fileName: 'AppName.apk',
      caption: 'Here is your APK file.'
    });
  };

  const getMovieInfo = async (name) => {
    try {
      const apiKey = 'your_tmdb_api_key';
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(name)}`);
      if (res.data.results.length === 0) return null;
      const movie = res.data.results[0];
      return `🎬 Movie: ${movie.title}\nOverview: ${movie.overview}\nRelease: ${movie.release_date}`;
    } catch {
      return null;
    }
  };

  const sendOwnerVcf = async (from) => {
    const vcfData = `BEGIN:VCARD
VERSION:3.0
FN:Anuga Senithu De Silva
TEL;TYPE=CELL:+94710695082
ADR;TYPE=home:;;Sri Lanka
END:VCARD`;
    await sock.sendMessage(from, {
      contacts: { displayName: 'Anuga Senithu', contacts: [{ vcard: vcfData }] }
    });
  };

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!text.startsWith(PREFIX)) return;
    const commandBody = text.slice(PREFIX.length).trim();

    switch (commandBody.toLowerCase().split(' ')[0]) {
      case 'ping':
        const start = Date.now();
        await reply(from, 'Testing speed...');
        const end = Date.now();
        await reply(from, `🏓 Pong! Speed: *${end - start}ms*`);
        break;

      case 'boom':
        const count = parseInt(commandBody.split(' ')[1]) || 5;
        for (let i = 0; i < count; i++) await reply(from, `💥 Boom! ${i + 1}`);
        break;

      case 'video':
        const videoUrl = commandBody.split(' ')[1];
        try {
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
