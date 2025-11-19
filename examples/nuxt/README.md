# Nuxt Example

This example demonstrates using Nuxt's **Nitro server engine** to create a secure server-side API route for sending emails.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js
   ```

2. Add environment variables to `.env` or `nuxt.config.ts`:
   ```
   FORWARD_EMAIL_API_KEY=your_api_key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

## Usage

The API route is located at `server/api/send.post.ts`. It is automatically registered by Nuxt.

Call it from your Vue components:

```typescript
const { data, error } = await useFetch('/api/send', {
  method: 'POST',
  body: {
    to: 'user@example.com',
    subject: 'Hello',
    message: 'Hello from Nuxt!'
  }
});
```
