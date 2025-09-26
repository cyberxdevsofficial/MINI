// server.js
const express = require("express");
const qrcode = require("qrcode");
const startBot = require("./index"); // Your bot entry point
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = "";
let pairings = 0; // count pairings

// serve static files (HTML, CSS, etc.) from public folder
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// QR linking route
app.get("/qr", async (req, res) => {
  if (!qrCodeData) return res.send("❌ QR not generated yet.");
  const qrImg = await qrcode.toDataURL(qrCodeData);
  res.send(`
    <h2>📲 Scan this QR with WhatsApp</h2>
    <img src="${qrImg}" />
    <p>Pairings so far: <b>${pairings}</b></p>
  `);
});

// Pairing via number (demo - extend for real use)
app.get("/pair", (req, res) => {
  const code = Math.floor(10000000 + Math.random() * 90000000);
  pairings++;
  fs.writeFileSync("pairings.json", JSON.stringify({ pairings }, null, 2));
  res.send(`
    <h2>🔗 Your Pair Code</h2>
    <p>Use this 8-digit code to pair: <b>${code}</b></p>
    <p>Total pairings: <b>${pairings}</b></p>
  `);
});

// Start bot
(async () => {
  const sock = await startBot();

  sock.ev.on("connection.update", (update) => {
    if (update.qr) qrCodeData = update.qr;
    if (update.connection === "open") {
      console.log("✅ Bot connected to WhatsApp");
    }
  });
})();

// Start server
app.listen(PORT, () =>
  console.log(`🌐 Web server running on http://localhost:${PORT}`)
);
