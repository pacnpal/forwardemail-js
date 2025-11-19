'use server';

import { emailClient } from '@/lib/email';

export type ActionState = {
  success?: boolean;
  error?: string;
  id?: string;
};

export async function sendEmailAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const to = formData.get('to') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!to || !subject || !message) {
    return { error: 'Missing required fields: to, subject, message' };
  }

  try {
    const result = await emailClient.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text: message,
    });

    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { error: error.message || 'Failed to send email' };
  }
}
