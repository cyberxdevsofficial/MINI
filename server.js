const express = require('express');
const path = require('path');
const { generatePairCode, getAllPairings } = require('./pair');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve frontend files
app.use(express.static('public'));

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate new pairing code
app.post('/pair', (req, res) => {
  const userName = req.body.username || 'Anonymous';
  const code = generatePairCode(userName);
  res.json({ success: true, code });
});

// Route to see all pairings (optional, for admin/debug)
app.get('/pairings', (req, res) => {
  const all = getAllPairings();
  res.json({ total: all.length, pairings: all });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
