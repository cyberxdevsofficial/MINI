const express = require('express');
const qrcode = require('qrcode');
const startBot = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;
let qrCodeData = '';

app.use(express.static('public'));

app.get('/qr', async (req, res) => {
  if (!qrCodeData) return res.send('QR not generated yet.');
  const qrImg = await qrcode.toDataURL(qrCodeData);
  res.send(`<img src='${qrImg}' />`);
});

(async () => {
  const sock = await startBot();
  sock.ev.on('connection.update', (update) => { 
    if (update.qr) qrCodeData = update.qr; 
  });
})();

app.listen(PORT, () => console.log(`🌐 Web running on port ${PORT}`));
