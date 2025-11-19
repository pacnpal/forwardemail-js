# SvelteKit Example

This example shows two ways to use `forwardemail-js` in SvelteKit:
1. **API Endpoints** (`+server.ts`)
2. **Form Actions** (`+page.server.ts`)

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

- **API Route**: `POST /api/send`
- **Form Action**: Submit a form to the `/contact` route.

Both run entirely on the server, keeping your API key secure.
