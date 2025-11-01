// Simple Express backend to receive contact form messages
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'messages.json');

app.use(cors());
app.use(express.json());

// ensure messages.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([] , null, 2));
}

app.get('/', (req, res) => {
  res.send('Portfolio backend running');
});

app.post('/api/contact', (req, res) => {
  const { user_name, user_email, message } = req.body;
  if (!user_name || !user_email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const msg = {
    id: Date.now(),
    name: user_name,
    email: user_email,
    message,
    receivedAt: new Date().toISOString()
  };

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    arr.push(msg);
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));

    // Optionally: send email via nodemailer if configured by env vars (not required)
    // If you want email notifications, we can add nodemailer and env vars later.

    return res.json({ success: true, message: 'Message received' });
  } catch (err) {
    console.error('Failed to save message', err);
    return res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/api/messages', (req, res) => {
  // simple listing endpoint (no auth) - for development only
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    res.json(arr);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read messages' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
