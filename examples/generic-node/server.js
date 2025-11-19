/**
 * Generic Node.js Example
 * 
 * A vanilla Node.js HTTP server implementation
 */

const http = require('http');
const { ForwardEmail } = require('forwardemail-js');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FORWARD_EMAIL_API_KEY;

if (!API_KEY) {
  console.error('Please set FORWARD_EMAIL_API_KEY environment variable');
  process.exit(1);
}

const client = new ForwardEmail({
  apiKey: API_KEY,
  timeout: 30000
});

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/send-email' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { to, subject, text, html } = data;

        if (!to || !subject) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }

        const result = await client.sendEmail({
          from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
          to,
          subject,
          text,
          html
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: result.id }));
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(error.statusCode || 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down...');
  client.close();
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
