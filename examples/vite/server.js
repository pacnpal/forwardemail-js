import express from 'express';
import { ForwardEmail } from 'forwardemail-js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY || 'your-api-key',
});

app.post('/api/send', async (req, res) => {
  try {
    const result = await client.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.message,
    });
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Backend running at http://localhost:3000');
});
