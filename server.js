require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4,
  connectionTimeout: 10000,
});

app.get('/', (req, res) => {
  res.send('SMTP demo server running. POST /send-test-mail to send a test email.');
});

app.post('/send-test-mail', async (req, res) => {
  const to = req.body.to || process.env.MAIL_TO_DEFAULT;

  if (!to) {
    return res.status(400).json({ error: 'Recipient "to" missing (body or MAIL_TO_DEFAULT env).' });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: req.body.subject || 'Test Mail',
      text: req.body.text || 'This is a test email sent via SMTP.',
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
