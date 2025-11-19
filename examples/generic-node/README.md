# Generic Node.js Example

This is a vanilla Node.js HTTP server example with zero framework dependencies. Ideal for microservices or simple scripts.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js
   ```

2. Run the server:
   ```bash
   FORWARD_EMAIL_API_KEY=your_api_key node server.js
   ```

## Usage

Send a POST request to `http://localhost:3000/send-email`:

```bash
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com", "subject":"Hello", "text":"World"}'
```
