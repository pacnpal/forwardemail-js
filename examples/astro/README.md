# Astro Example

This example demonstrates using Astro's **Server Endpoints** (API Routes) to send emails.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js
   ```

2. Configure environment variables in `.env`:
   ```
   FORWARD_EMAIL_API_KEY=your_key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

3. Ensure your `astro.config.mjs` is set for **SSR** (Server-Side Rendering) output (e.g., `output: 'server'`) if you want to run this in production on a Node.js adapter.

## Usage

The endpoint is located at `src/pages/api/send.ts`.

Call it from your frontend components:

```javascript
await fetch('/api/send', {
  method: 'POST',
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello',
    message: 'Hello from Astro!'
  })
});
```
