import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually (no extra deps needed)
try {
  const env = readFileSync(resolve('.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY || API_KEY === 'your_key_here') {
  console.error('ERROR: Set ANTHROPIC_API_KEY in .env');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: /^http:\/\/localhost:\d+$/ })); // allow any localhost port
app.use(express.json({ limit: '2mb' }));

app.post('/api/anthropic', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));
