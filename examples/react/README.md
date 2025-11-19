# React Example

This example demonstrates the **backend proxy pattern** for securely sending emails from a React app. Since React is client-side, we use an Express backend to protect the API key.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js express cors dotenv
   ```

2. Create `.env` file:
   ```
   FORWARD_EMAIL_API_KEY=your_api_key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

3. Run the backend server:
   ```bash
   node server.js
   ```

4. In your React app, import and use the `ContactForm` component from `src/ContactForm.jsx`.

## Architecture

- **Backend (`server.js`)**: Express server running on port 3001, handles email sending.
- **Frontend (`src/ContactForm.jsx`)**: React component that calls the backend API.

This keeps your API key secure on the server and prevents it from being exposed to the browser.
