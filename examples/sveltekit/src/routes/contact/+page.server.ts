import { fail } from '@sveltejs/kit';
import { ForwardEmail } from 'forwardemail-js';
import { env } from '$env/dynamic/private';

const client = new ForwardEmail({
  apiKey: env.FORWARD_EMAIL_API_KEY || '',
});

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const to = data.get('to') as string;
    const subject = data.get('subject') as string;
    const message = data.get('message') as string;

    if (!to || !subject || !message) {
      return fail(400, { to, subject, message, missing: true });
    }

    try {
      const result = await client.sendEmail({
        from: env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
        to,
        subject,
        text: message,
      });

      return { success: true, id: result.id };
    } catch (error: any) {
      return fail(500, { message: error.message });
    }
  },
};
