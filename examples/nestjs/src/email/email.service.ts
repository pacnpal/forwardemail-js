import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ForwardEmail, EmailOptions, EmailResponse, EmailLimitResponse } from 'forwardemail-js';

@Injectable()
export class EmailService implements OnModuleDestroy {
  private readonly client: ForwardEmail;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Ideally get this from ConfigService
    const apiKey = process.env.FORWARD_EMAIL_API_KEY;
    
    if (!apiKey) {
      this.logger.warn('FORWARD_EMAIL_API_KEY is not set');
    }

    this.client = new ForwardEmail({
      apiKey: apiKey || 'dummy-key-for-dev',
      timeout: 30000,
    });
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    return this.client.sendEmail(options);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<EmailResponse> {
    return this.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject: 'Welcome to our platform!',
      html: `<h1>Welcome, ${name}!</h1><p>We are glad to have you.</p>`,
      text: `Welcome, ${name}! We are glad to have you.`,
    });
  }

  async getLimits(): Promise<EmailLimitResponse> {
    return this.client.getEmailLimit();
  }

  onModuleDestroy() {
    this.logger.log('Closing email client connection');
    this.client.close();
  }
}
