# forwardemail-js Usage Examples

## Table of Contents

1. [Next.js (App Router & Server Actions)](nextjs/README.md)
2. [NestJS](nestjs/README.md)
3. [Fastify](fastify/server.js)
4. [Koa](koa/server.js)
5. [Generic Node.js](generic-node/server.js)
6. [React (Backend Proxy)](react/server.js)
7. [Nuxt](nuxt/server/api/send.post.ts)
8. [Vite (Backend Integration)](vite/server.js)
9. [Astro](astro/src/pages/api/send.ts)
10. [Remix](remix/app/routes/contact.tsx)
11. [SvelteKit](sveltekit/src/routes/api/send/+server.ts)
12. [AdonisJS](adonisjs/app/services/email_service.ts)
13. [Production Best Practices](#production-best-practices)

> **Note:** See [EDGE-RUNTIMES.md](../EDGE-RUNTIMES.md) for information about Edge Runtime compatibility (Cloudflare Workers, Vercel Edge).

---

## Production Best Practices

### Environment Configuration

```javascript
const { ForwardEmail } = require('forwardemail-js');

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

// Send a simple email
async function sendEmail() {
  try {
    const result = await client.sendEmail({
      from: 'hello@yourdomain.com',
      to: 'user@example.com',
      subject: 'Test Email',
      text: 'Hello from Forward Email!',
      html: '<h1>Hello from Forward Email!</h1>'
    });
    
    console.log('Email sent:', result.id);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

sendEmail();
```

## Express.js

```javascript
const express = require('express');
const { ForwardEmail } = require('forwardemail-js');

const app = express();
app.use(express.json());

const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

// Welcome email endpoint
app.post('/api/users/welcome', async (req, res) => {
  try {
    await emailClient.sendEmail({
      from: 'welcome@yourdomain.com',
      to: req.body.email,
      subject: 'Welcome!',
      html: `<h1>Welcome ${req.body.name}!</h1>`
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(3000);

// Graceful shutdown
process.on('SIGTERM', () => {
  emailClient.close();
  server.close(() => process.exit(0));
});
```

## Fastify

```javascript
const Fastify = require('fastify');
const { ForwardEmail } = require('forwardemail-js');

const fastify = Fastify({ logger: true });
const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

// Register email as a decorator
fastify.decorate('email', emailClient);

fastify.post('/send', async (request, reply) => {
  const { to, subject, html } = request.body;
  
  const result = await fastify.email.sendEmail({
    from: 'noreply@yourdomain.com',
    to,
    subject,
    html
  });
  
  return { success: true, id: result.id };
});

// Cleanup on close
fastify.addHook('onClose', () => {
  emailClient.close();
});

fastify.listen({ port: 3000 });
```

## Koa

```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const { ForwardEmail } = require('forwardemail-js');

const app = new Koa();
const router = new Router();
const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

app.use(bodyParser());

router.post('/send-email', async (ctx) => {
  const { to, subject, html } = ctx.request.body;
  
  try {
    const result = await emailClient.sendEmail({
      from: 'noreply@yourdomain.com',
      to,
      subject,
      html
    });
    
    ctx.body = { success: true, id: result.id };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

app.use(router.routes());
app.listen(3000);

process.on('SIGTERM', () => {
  emailClient.close();
  process.exit(0);
});
```

## NestJS

### email.service.ts

```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ForwardEmail, EmailOptions } from 'forwardemail-js';

@Injectable()
export class EmailService implements OnModuleDestroy {
  private readonly client: ForwardEmail;

  constructor() {
    this.client = new ForwardEmail({
      apiKey: process.env.FORWARD_EMAIL_API_KEY,
    });
  }

  async sendEmail(options: EmailOptions) {
    return this.client.sendEmail(options);
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail({
      from: 'welcome@yourdomain.com',
      to,
      subject: 'Welcome!',
      html: `<h1>Welcome ${name}!</h1>`,
    });
  }

  async getEmailLimits() {
    return this.client.getEmailLimit();
  }

  onModuleDestroy() {
    this.client.close();
  }
}
```

### email.controller.ts

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() body: any) {
    const result = await this.emailService.sendEmail({
      from: 'noreply@yourdomain.com',
      to: body.to,
      subject: body.subject,
      html: body.html,
    });

    return { success: true, id: result.id };
  }
}
```

## Hapi

```javascript
const Hapi = require('@hapi/hapi');
const { ForwardEmail } = require('forwardemail-js');

const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  server.route({
    method: 'POST',
    path: '/send-email',
    handler: async (request, h) => {
      try {
        const { to, subject, html } = request.payload;
        
        const result = await emailClient.sendEmail({
          from: 'noreply@yourdomain.com',
          to,
          subject,
          html
        });
        
        return { success: true, id: result.id };
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);

  // Cleanup
  process.on('SIGTERM', async () => {
    emailClient.close();
    await server.stop();
  });
};

init();
```

## Next.js API Routes

### pages/api/send-email.ts

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { ForwardEmail } from 'forwardemail-js';

// Create a singleton client
let emailClient: ForwardEmail | null = null;

function getEmailClient() {
  if (!emailClient) {
    emailClient = new ForwardEmail({
      apiKey: process.env.FORWARD_EMAIL_API_KEY!,
    });
  }
  return emailClient;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;
    const client = getEmailClient();

    const result = await client.sendEmail({
      from: 'noreply@yourdomain.com',
      to,
      subject,
      html,
    });

    res.status(200).json({ success: true, id: result.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    emailClient?.close();
  });
}
```

## AWS Lambda

```javascript
const { ForwardEmail } = require('forwardemail-js');

// Create client outside handler for connection reuse
const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    const result = await emailClient.sendEmail({
      from: 'lambda@yourdomain.com',
      to: body.to,
      subject: body.subject,
      html: body.html
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: result.id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};

// Note: In Lambda, connections are automatically cleaned up
// But you can add explicit cleanup in Lambda lifecycle hooks if needed
```

## Production Best Practices

### Environment Configuration

```javascript
// config.js
require('dotenv').config();

module.exports = {
  forwardEmail: {
    apiKey: process.env.FORWARD_EMAIL_API_KEY,
    timeout: parseInt(process.env.EMAIL_TIMEOUT || '30000'),
    defaultFrom: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com'
  }
};
```

### Error Handling & Retry Logic

```javascript
const { ForwardEmail } = require('forwardemail-js');

class EmailService {
  constructor() {
    this.client = new ForwardEmail({
      apiKey: process.env.FORWARD_EMAIL_API_KEY
    });
  }

  async sendWithRetry(options, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.client.sendEmail(options);
      } catch (error) {
        // Retry on rate limits or network errors
        if (
          error.statusCode === 429 ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET')
        ) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        throw error;
      }
    }
  }

  async sendBulkEmails(emails) {
    // Check limits first
    const limits = await this.client.getEmailLimit();
    const remaining = limits.limit - limits.count;
    
    if (emails.length > remaining) {
      throw new Error(`Not enough quota. Remaining: ${remaining}, Requested: ${emails.length}`);
    }

    // Send in batches to avoid overwhelming the API
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(email => this.sendWithRetry(email))
      );
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  close() {
    this.client.close();
  }
}

module.exports = EmailService;
```

### Queue-Based Email Sending (with Bull)

```javascript
const Bull = require('bull');
const { ForwardEmail } = require('forwardemail-js');

const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

// Create queue
const emailQueue = new Bull('emails', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Process emails
emailQueue.process(async (job) => {
  const { emailOptions } = job.data;
  
  try {
    const result = await emailClient.sendEmail(emailOptions);
    return result;
  } catch (error) {
    // Let Bull handle retries
    throw error;
  }
});

// Add email to queue
async function queueEmail(emailOptions) {
  await emailQueue.add(
    { emailOptions },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  );
}

// Usage
queueEmail({
  from: 'noreply@yourdomain.com',
  to: 'user@example.com',
  subject: 'Queued Email',
  html: '<p>This email was sent via queue</p>'
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await emailQueue.close();
  emailClient.close();
  process.exit(0);
});
```

### Health Check Endpoint

```javascript
app.get('/health', async (req, res) => {
  try {
    // Quick health check - get limits without sending email
    const limits = await emailClient.getEmailLimit();
    
    res.json({
      status: 'healthy',
      service: 'email',
      emailsRemaining: limits.limit - limits.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'email',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```
