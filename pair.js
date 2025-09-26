const fs = require('fs');
const path = require('path');

const pairingsFile = path.join(__dirname, 'pairings.json');

// Ensure pairings.json exists
if (!fs.existsSync(pairingsFile)) {
  fs.writeFileSync(pairingsFile, JSON.stringify([]));
}

/**
 * Generate new 8-digit pairing code and save it
 * @param {string} userName
 * @returns {string} code
 */
function generatePairCode(userName) {
  const code = Math.floor(10000000 + Math.random() * 90000000).toString();
  const pairings = JSON.parse(fs.readFileSync(pairingsFile));
  pairings.push({ user: userName, code, time: new Date() });
  fs.writeFileSync(pairingsFile, JSON.stringify(pairings, null, 2));
  return code;
}

/**
 * Get all pairings
 */
function getAllPairings() {
  return JSON.parse(fs.readFileSync(pairingsFile));
}

module.exports = { generatePairCode, getAllPairings };
