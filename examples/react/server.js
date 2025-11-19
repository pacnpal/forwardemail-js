const express = require('express');
const cors = require('cors');
const { ForwardEmail } = require('forwardemail-js');
require('dotenv').config();

const app = express();
app.use(cors()); // Allow frontend to connect
app.use(express.json());

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

app.post('/api/email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    const result = await client.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text: message
    });

    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
