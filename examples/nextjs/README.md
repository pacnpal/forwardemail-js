# Next.js 16 Example

This example demonstrates how to integrate `forwardemail-js` with **Next.js 16** using **App Router**, **Server Actions**, and **React 19** features.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js
   ```

2. Add environment variables to `.env.local`:
   ```bash
   FORWARD_EMAIL_API_KEY=your_api_key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

## Usage

### 1. Server Action (Recommended)
The server action is defined in `app/actions.ts`. We use the `useActionState` hook (React 19) to handle the form state.

**`app/contact-form.tsx`**:
```tsx
'use client';

import { useActionState } from 'react';
import { sendEmailAction, ActionState } from '@/app/actions';

const initialState: ActionState = {};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendEmailAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="to">To:</label>
        <input id="to" name="to" type="email" required className="border p-2 rounded" />
      </div>
      
      <div>
        <label htmlFor="subject">Subject:</label>
        <input id="subject" name="subject" type="text" required className="border p-2 rounded" />
      </div>
      
      <div>
        <label htmlFor="message">Message:</label>
        <textarea id="message" name="message" required className="border p-2 rounded" />
      </div>

      <button type="submit" disabled={isPending} className="bg-blue-500 text-white p-2 rounded">
        {isPending ? 'Sending...' : 'Send Email'}
      </button>

      {state.success && <p className="text-green-500">Email sent! ID: {state.id}</p>}
      {state.error && <p className="text-red-500">Error: {state.error}</p>}
    </form>
  );
}
```

### 2. API Route
The API route is located at `app/api/send/route.ts`. Useful for external webhooks or non-React clients.

```typescript
const response = await fetch('/api/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello',
    text: 'Hello world'
  })
});
```

### 3. Singleton Pattern
We use a singleton pattern in `lib/email.ts` using `globalThis` to ensure only one instance of the client is created, preventing connection leaks during hot reloads in development.
