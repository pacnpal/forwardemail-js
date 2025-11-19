# Fastify Example

This example demonstrates how to create a reusable **Fastify Plugin** for `forwardemail-js`.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js fastify fastify-plugin
   ```

2. Run the server:
   ```bash
   FORWARD_EMAIL_API_KEY=your_key node server.js
   ```

## Architecture

- **Plugin Pattern**: We wrap the client in `fastify-plugin` to decorate the Fastify instance.
- **Access**: Access the client anywhere via `fastify.email`.
- **Cleanup**: We use the `onClose` hook to ensure connections are closed properly.

## Routes

- `POST /send-email`: Sends an email.
- `GET /limits`: Checks your sending limits.
