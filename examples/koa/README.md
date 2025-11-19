# Koa Example

This example shows a simple **Koa** server integration.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js koa @koa/router koa-bodyparser
   ```

2. Run the server:
   ```bash
   FORWARD_EMAIL_API_KEY=your_key node server.js
   ```

## Usage

Send a POST request to `http://localhost:3000/send-email`.
