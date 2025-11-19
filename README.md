# forwardemail-js

> Enterprise-grade Node.js SDK for the Forward Email API - Zero dependencies, native Node.js, works with any framework

[![npm version](https://badge.fury.io/js/forwardemail-js.svg)](https://www.npmjs.com/package/forwardemail-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Zero Dependencies** - Built entirely with native Node.js modules  
✅ **Enterprise Production-Ready** - Connection pooling, proper error handling, graceful shutdown  
✅ **Framework Agnostic** - Works with Express, Fastify, Koa, Hapi, NestJS, and any Node.js framework  
✅ **TypeScript Native** - Full type definitions included  
✅ **CLI Tool Included** - `forwardemail` / `fe` commands for testing and configuration  
✅ **Nodemailer Compatible** - Familiar API following Nodemailer's message options  
✅ **Async/Await** - Modern promise-based API  
✅ **HTTP Agent Pooling** - Reuses connections for optimal performance  

## Installation

```bash
npm install forwardemail-js
```

## Quick Start

### Programmatic Usage

```typescript
import { ForwardEmail } from 'forwardemail-js';

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});

// Send an email
const result = await client.sendEmail({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello from Forward Email',
  text: 'This is a test email',
  html: '<p>This is a test email</p>'
});

console.log('Email sent:', result.id);

// Graceful shutdown (important for production!)
process.on('SIGTERM', () => {
  client.close();
  process.exit(0);
});
```

### CLI Usage

You can use the CLI without installing it globally by using `npx`:

```bash
# Configure your API key
npx forwardemail config

# Test the API connection
npx forwardemail test

# Send an email
npx forwardemail send \
  --from "hello@yourdomain.com" \
  --to "user@example.com" \
  --subject "Test Email" \
  --text "Hello from the CLI!"
```

Or install globally if you prefer:

```bash
npm install -g forwardemail-js
forwardemail send ...
```
# Check your account
forwardemail account

# Check sending limits
forwardemail limits

# List recent emails
forwardemail list

# List domains
forwardemail domains

# List aliases
forwardemail aliases yourdomain.com
```

## Framework Examples

We provide complete, copy-paste ready examples for all major Node.js frameworks:

- **[Next.js 16 (App Router)](examples/nextjs)** - Server Actions, API Routes, React 19 Hooks
- **[NestJS](examples/nestjs)** - Modules, Services, Controllers, Dependency Injection
- **[Nuxt](examples/nuxt)** - Nitro Server Engine integration
- **[Remix](examples/remix)** - Action Functions
- **[SvelteKit](examples/sveltekit)** - API Endpoints & Form Actions
- **[Fastify](examples/fastify)** - Plugin architecture & Decorators
- **[Express](examples/express-example.js)** - Classic middleware pattern
- **[Koa](examples/koa)** - Modern middleware pattern
- **[Hapi](examples/hapi)** - Server configuration & Routes
- **[AdonisJS](examples/adonisjs)** - Service provider pattern
- **[Astro](examples/astro)** - Server Endpoints
- **[Vite](examples/vite)** - Backend integration
- **[React](examples/react)** - Client + Backend Proxy pattern
- **[Generic Node.js](examples/generic-node)** - Vanilla HTTP server

See [examples/EXAMPLES.md](examples/EXAMPLES.md) for a consolidated view.

## API Reference

### Constructor

```typescript
new ForwardEmail(config: ForwardEmailConfig)
```

#### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | **required** | Your Forward Email API key |
| `baseURL` | `string` | `https://api.forwardemail.net` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |

### Methods

#### `sendEmail(options: EmailOptions): Promise<EmailResponse>`

Send an email. Follows Nodemailer's message configuration.

**Options:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | `string` | ✅ | Sender email address |
| `to` | `string \| string[]` | ✅ | Recipient(s) |
| `subject` | `string` | ✅ | Email subject |
| `text` | `string` | | Plain text content |
| `html` | `string` | | HTML content |
| `cc` | `string \| string[]` | | CC recipients |
| `bcc` | `string \| string[]` | | BCC recipients |
| `attachments` | `Attachment[]` | | File attachments |
| `replyTo` | `string` | | Reply-to address |
| `priority` | `'high' \| 'normal' \| 'low'` | | Email priority |
| `headers` | `object` | | Custom headers |

See [Nodemailer docs](https://nodemailer.com/message/) for all supported options.

#### `listEmails(options?: ListEmailsOptions): Promise<EmailResponse[]>`

List sent emails with pagination and filtering.

#### `getEmail(emailId: string): Promise<EmailResponse>`

Get details of a specific email.

#### `deleteEmail(emailId: string): Promise<{ message: string }>`

Delete a specific email.

#### `getEmailLimit(): Promise<EmailLimitResponse>`

Get current email sending limits.

#### `getAccount(): Promise<Account>`

Get account information.

#### `listDomains(): Promise<Domain[]>`

List all domains.

#### `getDomain(domainId: string): Promise<Domain>`

Get details of a specific domain.

#### `listAliases(domainId: string): Promise<Alias[]>`

List all aliases for a domain.

#### `close(): void`

Close the HTTP agent and clean up resources. **Important for graceful shutdown!**

## Production Best Practices

### Environment Variables

```bash
# .env
FORWARD_EMAIL_API_KEY=your_api_key_here
```

```typescript
import { config } from 'dotenv';
config();

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY
});
```

### Error Handling

```typescript
try {
  await client.sendEmail({ /* ... */ });
} catch (error) {
  if (error.statusCode === 429) {
    // Rate limited - implement retry logic
  } else if (error.statusCode === 401) {
    // Invalid API key
  } else {
    // Other error
  }
  console.error('Email error:', error.message);
}
```

### Graceful Shutdown

```typescript
// Handle shutdown signals
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, closing connections...`);
    client.close();
    // Close other resources (database, etc.)
    process.exit(0);
  });
});
```

### Connection Pooling

The client automatically uses HTTP agent connection pooling with:
- Keep-alive enabled
- Max 50 sockets
- Max 10 free sockets
- Automatic timeout handling

### Rate Limiting

```typescript
// Check limits before sending bulk emails
const limits = await client.getEmailLimit();
const remaining = limits.limit - limits.count;

if (remaining < 10) {
  console.warn('Approaching rate limit!');
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT © [Your Name]

## Support

- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/forwardemail-js/issues)
- 📖 Docs: [Forward Email API](https://forwardemail.net/api)

---

**Made with ❤️ using native Node.js - zero dependencies, maximum reliability**
