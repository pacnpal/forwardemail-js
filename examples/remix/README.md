# Remix Example

This example demonstrates using Remix **Action Functions** to handle form submissions and send emails on the server.

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

## Usage

The example `app/routes/contact.tsx` shows a full form implementation:

1. The `action` function runs on the server, uses `forwardemail-js` to send the email.
2. The component renders the form and displays success/error messages based on the action result.

This leverages Remix's progressive enhancement—it works even without JavaScript enabled!
