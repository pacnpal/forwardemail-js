# Vite Example

This example shows how to integrate `forwardemail-js` with a Vite project using a separate **Express backend**. This is the standard way to handle secure server-side logic in a Vite app.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js express cors
   ```

2. Run the backend server:
   ```bash
   FORWARD_EMAIL_API_KEY=your_key node server.js
   ```

3. In your Vite frontend (`src/main.ts` or similar), make fetch requests to `http://localhost:3000/api/send`.

## Why a separate server?

Vite is a frontend build tool. While it has a dev server, for production you need a real Node.js server to securely hold your API key and send emails. This example demonstrates that architecture.
