/**
 * forwardemail-js - Official Node.js SDK for Forward Email API
 * 
 * Send emails easily from any Node.js web framework using the Forward Email API.
 * This library follows Nodemailer's message configuration for familiarity.
 * 
 * @example
 * ```typescript
 * import { ForwardEmail } from 'forwardemail-js';
 * 
 * const client = new ForwardEmail({
 *   apiKey: process.env.FORWARD_EMAIL_API_KEY
 * });
 * 
 * await client.sendEmail({
 *   from: 'hello@yourdomain.com',
 *   to: 'user@example.com',
 *   subject: 'Test Email',
 *   text: 'Hello World',
 *   html: '<p>Hello World</p>'
 * });
 * ```
 */

export { ForwardEmail } from './client.js';
export * from './types.js';

// Default export for convenience
import { ForwardEmail } from './client.js';
export default ForwardEmail;
