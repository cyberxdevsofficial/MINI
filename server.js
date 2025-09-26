const express = require('express');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const startBot = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;
let qrCodeData = '';

const PAIR_FILE = './pairings.json';
if (!fs.existsSync(PAIR_FILE)) fs.writeFileSync(PAIR_FILE, JSON.stringify([]));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Route to show QR code
app.get('/qr', async (req, res) => {
  if (!qrCodeData) return res.send('QR not generated yet.');
  const qrImg = await qrcode.toDataURL(qrCodeData);
  res.send(`<img src='${qrImg}' />`);
});

// Route to generate or submit 8-digit pair code
app.post('/pair', (req, res) => {
  let { pairCode } = req.body;
  if (!pairCode) pairCode = Math.floor(10000000 + Math.random() * 90000000).toString();
  const pairings = JSON.parse(fs.readFileSync(PAIR_FILE));
  pairings.push({ code: pairCode, date: new Date() });
  fs.writeFileSync(PAIR_FILE, JSON.stringify(pairings));
  res.send(`✅ Paired with code: ${pairCode}\nTotal pairings: ${pairings.length}`);
});

// Show total pairings
app.get('/pairings', (req, res) => {
  const pairings = JSON.parse(fs.readFileSync(PAIR_FILE));
  res.send(`Total pairings: ${pairings.length}`);
});

// Start bot
(async () => {
  const sock = await startBot();
  sock.ev.on('connection.update', (update) => { 
    if (update.qr) qrCodeData = update.qr; 
  });
})();

app.listen(PORT, () => console.log(`🌐 Web running on port ${PORT}`));
