# AdonisJS Example

This example demonstrates creating a reusable **Email Service** in AdonisJS.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js
   ```

2. Define environment variables in `start/env.ts` and `.env`:
   ```
   FORWARD_EMAIL_API_KEY=your_key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

## Usage

Import the service in your controllers:

```typescript
import emailService from '#services/email_service'

export default class UsersController {
  async register({ request }: HttpContext) {
    // ...
    await emailService.sendWelcomeEmail(user.email, user.name)
  }
}
```
