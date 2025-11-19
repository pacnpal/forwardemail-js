/**
 * Express.js Example
 * 
 * Demonstrates how to integrate forwardemail-js with Express
 */

const express = require('express');
const { ForwardEmail } = require('forwardemail-js');

const app = express();
app.use(express.json());

// Initialize the Forward Email client
const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY,
  timeout: 30000
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'email-api' });
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, and (text or html)'
      });
    }

    const result = await emailClient.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text,
      html
    });

    res.json({
      success: true,
      emailId: result.id,
      messageId: result.messageId,
      status: result.status
    });
  } catch (error) {
    console.error('Email send error:', error);
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      statusCode
    });
  }
});

// Get email limits endpoint
app.get('/api/email-limits', async (req, res) => {
  try {
    const limits = await emailClient.getEmailLimit();
    res.json({
      used: limits.count,
      limit: limits.limit,
      remaining: limits.limit - limits.count,
      percentage: ((limits.count / limits.limit) * 100).toFixed(1)
    });
  } catch (error) {
    console.error('Failed to get limits:', error);
    res.status(500).json({ error: error.message });
  }
});

// List recent emails endpoint
app.get('/api/emails', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const emails = await emailClient.listEmails({ page, limit });
    res.json({ emails, page, limit });
  } catch (error) {
    console.error('Failed to list emails:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
  console.log('Endpoints:');
  console.log(`  POST   http://localhost:${PORT}/api/send-email`);
  console.log(`  GET    http://localhost:${PORT}/api/email-limits`);
  console.log(`  GET    http://localhost:${PORT}/api/emails`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down gracefully...');
  
  emailClient.close();
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
