# Edge Runtime Compatibility

## ⚠️ Important: Node.js Native Only

**forwardemail-js** is built using **native Node.js modules** (`https`, `http`, `Buffer`, etc.) for maximum reliability and zero dependencies. This means it works perfectly in **all standard Node.js environments** but **does NOT work in Edge Runtimes** like:

- ❌ Cloudflare Workers
- ❌ Vercel Edge Functions
- ❌ Netlify Edge Functions
- ❌ Deno Deploy (Edge)

These environments use the Web Standard `fetch` API and don't support Node.js built-ins like `https.request`.

## ✅ Supported Environments

This library works in **all standard Node.js runtimes**:

- ✅ Node.js servers (Express, Fastify, Koa, Hapi, etc.)
- ✅ Next.js App Router (Server Components, API Routes, Server Actions)
- ✅ Remix (Loaders & Actions)
- ✅ SvelteKit (Server routes, Form Actions)
- ✅ Nuxt (Nitro server routes)
- ✅ NestJS
- ✅ AdonisJS
- ✅ Astro (SSR endpoints)
- ✅ AWS Lambda (Node.js runtime)
- ✅ Google Cloud Functions (Node.js runtime)
- ✅ Azure Functions (Node.js runtime)
- ✅ Vercel Serverless Functions (Node.js runtime)
- ✅ Netlify Functions (Node.js runtime)

## Why Edge Runtimes Don't Work

Edge runtimes are designed to be minimal and use Web Standard APIs. They don't include Node.js-specific modules like:

```javascript
// These don't exist in Edge runtimes:
const https = require('https'); // ❌
const http = require('http');   // ❌
```

To support Edge runtimes, the library would need to:
1. Use `fetch()` instead of `https.request()` - This would add the `node-fetch` dependency
2. Use `Uint8Array` instead of `Buffer` - Different API surface
3. Add polyfills for other Node.js built-ins

**This would contradict the core design goal: zero dependencies and native Node.js reliability.**

## Recommended Approach for Edge Runtimes

If you **must** send emails from an Edge Runtime, you have two options:

### Option 1: Call Your Own Node.js Backend

```javascript
// In your Edge Function
const response = await fetch('https://your-nodejs-backend.com/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to, subject, text })
});
```

Then use `forwardemail-js` in your Node.js backend.

### Option 2: Use Forward Email's API Directly with `fetch`

```javascript
// In your Edge Function (without forwardemail-js)
const apiKey = 'your-api-key';
const auth = btoa(`${apiKey}:`);

const response = await fetch('https://api.forwardemail.net/v1/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`,
  },
  body: JSON.stringify({
    from: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Hello',
    text: 'Message'
  })
});
```

This bypasses the library but works in Edge environments. You lose:
- Type safety
- Connection pooling
- Error handling
- Graceful cleanup
- Convenience methods

## Design Philosophy

**forwardemail-js** is optimized for:

1. **Enterprise Production Reliability**: Native Node.js modules are battle-tested
2. **Zero Dependencies**: No supply chain risk, minimal attack surface
3. **Performance**: HTTP agent connection pooling, keep-alive
4. **Framework Compatibility**: Works with ANY Node.js framework

If you need Edge Runtime support, you're better off using the API directly with `fetch()` as shown above.

---

**For 99% of use cases** (traditional Node.js backends), this library is the best choice. For Edge-only deployments, consider using a Node.js serverless function instead.
