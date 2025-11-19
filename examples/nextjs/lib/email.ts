import { ForwardEmail } from 'forwardemail-js';

// Use globalThis to cache the client instance in development
// This prevents creating multiple instances during hot reloads
const globalForEmail = globalThis as unknown as { forwardEmail?: ForwardEmail };

export const emailClient =
  globalForEmail.forwardEmail ||
  new ForwardEmail({
    apiKey: process.env.FORWARD_EMAIL_API_KEY!,
    // Optional: Custom timeout or base URL
    timeout: 30000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForEmail.forwardEmail = emailClient;
}
