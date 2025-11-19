import { ForwardEmail } from 'forwardemail-js'
import env from '#start/env'

export class EmailService {
  private client: ForwardEmail

  constructor() {
    this.client = new ForwardEmail({
      apiKey: env.get('FORWARD_EMAIL_API_KEY'),
    })
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.client.sendEmail({
      from: env.get('DEFAULT_FROM_EMAIL', 'noreply@yourdomain.com'),
      to,
      subject: 'Welcome!',
      html: `<h1>Welcome ${name}!</h1>`,
    })
  }

  // Optional: Cleanup method if you use this as a singleton
  close() {
    this.client.close()
  }
}

const emailService = new EmailService()
export default emailService
