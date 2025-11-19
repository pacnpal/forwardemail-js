import { json } from '@sveltejs/kit';
import { ForwardEmail } from 'forwardemail-js';
import { env } from '$env/dynamic/private';

const client = new ForwardEmail({
  apiKey: env.FORWARD_EMAIL_API_KEY || '',
});

export async function POST({ request }) {
  const { to, subject, message } = await request.json();

  if (!to || !subject || !message) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await client.sendEmail({
      from: env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text: message,
    });

    return json({ success: true, id: result.id });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
