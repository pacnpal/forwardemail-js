# NestJS Example

This example shows how to wrap `forwardemail-js` in a clean, reusable NestJS module.

## Setup

1. Install dependencies:
   ```bash
   npm install forwardemail-js
   ```

2. Copy the `src/email` folder into your NestJS project.

3. Import the module in your `AppModule` (or wherever needed):

   ```typescript
   import { Module } from '@nestjs/common';
   import { EmailModule } from './email/email.module';

   @Module({
     imports: [EmailModule],
   })
   export class AppModule {}
   ```

4. Set environment variables:
   ```bash
   FORWARD_EMAIL_API_KEY=your_key
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   ```

## Usage

Inject the `EmailService` into any provider or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Injectable()
export class UserService {
  constructor(private readonly emailService: EmailService) {}

  async registerUser(user: any) {
    // ... create user logic
    
    await this.emailService.sendWelcomeEmail(user.email, user.name);
  }
}
```
