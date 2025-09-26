const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Simple JSON storage for pairings
const pairingsFile = path.join(__dirname, "pairings.json");
if (!fs.existsSync(pairingsFile)) {
  fs.writeFileSync(pairingsFile, JSON.stringify([]));
}

// Routes
app.get("/qr", (req, res) => {
  res.send("<h1>Scan your QR here (to be implemented)</h1>");
});

app.get("/pair", (req, res) => {
  const code = Math.floor(10000000 + Math.random() * 90000000).toString();
  let data = JSON.parse(fs.readFileSync(pairingsFile));
  data.push({ code, time: new Date() });
  fs.writeFileSync(pairingsFile, JSON.stringify(data, null, 2));
  res.send(`<h1>Your Pairing Code: ${code}</h1>`);
});

// Homepage handled by public/index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
