import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailOptions } from 'forwardemail-js';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() body: EmailOptions) {
    try {
      const result = await this.emailService.sendEmail(body);
      return { success: true, id: result.id };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to send email',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('limits')
  async getLimits() {
    return this.emailService.getLimits();
  }
}
