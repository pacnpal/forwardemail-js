# Hapi Example

This example demonstrates integration with the **Hapi** framework.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js @hapi/hapi
   ```

2. Run the server:
   ```bash
   FORWARD_EMAIL_API_KEY=your_key node server.js
   ```

## Features

- **Native Payload Parsing**: Uses Hapi's native payload handling.
- **Error Handling**: Uses Hapi's `h.response()` helper.
- **Cleanup**: Graceful shutdown on SIGTERM.
