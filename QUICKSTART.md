# Quick Start Guide

## Installation

```bash
npm install forwardemail-js
```

## 1. Configure CLI (Recommended)

```bash
# Set up your API key
npx forwardemail config

# Test the connection
npx forwardemail test
```

## 2. Send Your First Email (CLI)

```bash
npx forwardemail send \
  --from "hello@yourdomain.com" \
  --to "user@example.com" \
  --subject "My First Email" \
  --text "Hello from Forward Email!"
```

## 3. Send Email from Code

### JavaScript (CommonJS)

```javascript
const { ForwardEmail } = require('forwardemail-js');

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

async function main() {
  const result = await client.sendEmail({
    from: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Hello!',
    text: 'This is my first email',
    html: '<h1>This is my first email</h1>'
  });

  console.log('Email sent!', result.id);
  client.close();
}

main();
```

### TypeScript (ES Modules)

```typescript
import { ForwardEmail } from 'forwardemail-js';

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

const result = await client.sendEmail({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello!',
  text: 'This is my first email',
  html: '<h1>This is my first email</h1>'
});

console.log('Email sent!', result.id);
client.close();
```

## 4. Express Integration (3 minutes)

```javascript
const express = require('express');
const { ForwardEmail } = require('forwardemail-js');

const app = express();
app.use(express.json());

const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

app.post('/send-email', async (req, res) => {
  try {
    const result = await emailClient.sendEmail({
      from: 'noreply@yourdomain.com',
      to: req.body.email,
      subject: req.body.subject,
      html: req.body.html
    });
    
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Important: Graceful shutdown
process.on('SIGTERM', () => {
  emailClient.close();
  server.close();
});
```

## 5. Check Your Limits

```bash
# CLI
npx forwardemail limits

# Or in code:
const limits = await client.getEmailLimit();
console.log(`Used ${limits.count} of ${limits.limit} emails`);
```

## 6. View Your Account

```bash
# CLI
npx forwardemail account

# Or in code:
const account = await client.getAccount();
console.log(account.email, account.plan);
```

## Environment Setup

Create a `.env` file:

```bash
FORWARD_EMAIL_API_KEY=your_api_key_here
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

Then use it in your app:

```javascript
require('dotenv').config();

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});
```

## Common Patterns

### Send with Attachments

```javascript
await client.sendEmail({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Document Attached',
  text: 'Please find the document attached',
  attachments: [
    {
      filename: 'document.pdf',
      path: '/path/to/document.pdf'
    }
  ]
});
```

### Send to Multiple Recipients

```javascript
await client.sendEmail({
  from: 'hello@yourdomain.com',
  to: ['user1@example.com', 'user2@example.com'],
  cc: 'manager@example.com',
  bcc: 'archive@yourdomain.com',
  subject: 'Team Update',
  html: '<h1>Important Team News</h1>'
});
```

### Error Handling

```javascript
try {
  await client.sendEmail({ /* ... */ });
} catch (error) {
  if (error.statusCode === 429) {
    console.error('Rate limit exceeded');
  } else if (error.statusCode === 401) {
    console.error('Invalid API key');
  } else {
    console.error('Email failed:', error.message);
  }
}
```

## Next Steps

- Read the [README.md](README.md) for full API documentation
- Check [examples/EXAMPLES.md](examples/EXAMPLES.md) for framework-specific integrations
- Review [SUMMARY.md](SUMMARY.md) for architecture details

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/forwardemail-js/issues)
- Docs: [Forward Email API](https://forwardemail.net/api)

---

**You're ready to go! 🚀**
