const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Phishing keywords
const suspiciousKeywords = [
  'login', 'verify', 'update', 'secure', 'account', 'banking',
  'paypal', 'password', 'credential', 'free', 'winner', 'click',
  'confirm', 'suspended', 'unusual', 'immediate', 'urgent'
];

// URL Scanner API
app.post('/api/scan-url', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let riskScore = 0;
  const flags = [];

  if (!url.startsWith('https://')) { riskScore += 30; flags.push('No HTTPS'); }
  suspiciousKeywords.forEach((keyword) => {
    if (url.toLowerCase().includes(keyword)) { riskScore += 15; flags.push(`Suspicious keyword: ${keyword}`); }
  });
  if (url.length > 75) { riskScore += 20; flags.push('URL is too long'); }
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { riskScore += 40; flags.push('IP address used instead of domain'); }
  const domainParts = url.replace('https://', '').replace('http://', '').split('/')[0].split('.');
  if (domainParts.length > 4) { riskScore += 20; flags.push('Too many subdomains'); }

  let risk_level, status, recommendation;
  if (riskScore >= 50) { risk_level = 'HIGH'; status = 'Suspicious Website Detected'; recommendation = 'Do NOT visit this website. It may be a phishing site.'; }
  else if (riskScore >= 25) { risk_level = 'MEDIUM'; status = 'Potentially Suspicious'; recommendation = 'Be cautious. Verify the website before proceeding.'; }
  else { risk_level = 'LOW'; status = 'Looks Safe'; recommendation = 'This URL appears to be safe.'; }

  res.json({ url, risk_level, risk_score: riskScore, status, recommendation, flags });
});

// Email Analyzer API
app.post('/api/analyze-email', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Email content is required' });

  let riskScore = 0;
  const flags = [];
  const lowerContent = content.toLowerCase();

  const urgentKeywords = ['urgent', 'immediately', 'suspended', 'verify', 'confirm', 'update', 'expire', 'limited time'];
  const threatKeywords = ['suspended', 'blocked', 'locked', 'terminated', 'unauthorized'];
  const credentialKeywords = ['password', 'username', 'credit card', 'bank account', 'ssn', 'social security'];
  const scamKeywords = ['winner', 'won', 'prize', 'lottery', 'free', 'claim', 'reward'];

  urgentKeywords.forEach((k) => { if (lowerContent.includes(k)) { riskScore += 15; flags.push(`Urgent language: "${k}"`); } });
  threatKeywords.forEach((k) => { if (lowerContent.includes(k)) { riskScore += 20; flags.push(`Threat language: "${k}"`); } });
  credentialKeywords.forEach((k) => { if (lowerContent.includes(k)) { riskScore += 25; flags.push(`Credential request: "${k}"`); } });
  scamKeywords.forEach((k) => { if (lowerContent.includes(k)) { riskScore += 20; flags.push(`Scam language: "${k}"`); } });
  if (lowerContent.includes('http://')) { riskScore += 20; flags.push('Contains non-HTTPS links'); }

  let risk_level, status, recommendation;
  if (riskScore >= 50) { risk_level = 'HIGH'; status = 'Phishing Email Detected'; recommendation = 'Do NOT click any links or reply to this email. Delete it immediately.'; }
  else if (riskScore >= 25) { risk_level = 'MEDIUM'; status = 'Suspicious Email'; recommendation = 'Be cautious. Verify the sender before taking any action.'; }
  else { risk_level = 'LOW'; status = 'Email Looks Safe'; recommendation = 'This email appears to be safe.'; }

  res.json({ risk_level, risk_score: riskScore, status, recommendation, flags });
});

app.get('/', (req, res) => {
  res.json({ message: 'Phishing Detection API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});