require('dotenv').config();
const express = require('express');
const { Resend } = require('resend');

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/', (req, res) => {
  res.send('Resend demo server running. POST /send-test-mail to send a test email.');
});

app.post('/send-test-mail', async (req, res) => {
  const to = req.body.to || process.env.MAIL_TO_DEFAULT;

  if (!to) {
    return res.status(400).json({ error: 'Recipient "to" missing (body or MAIL_TO_DEFAULT env).' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM,
      to,
      subject: req.body.subject || 'Test Mail',
      text: req.body.text || 'This is a test email sent via Resend.',
    });

    if (error) {
      return res.status(500).json({ error });
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
