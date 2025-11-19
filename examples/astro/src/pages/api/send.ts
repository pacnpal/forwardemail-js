import type { APIRoute } from 'astro';
import { ForwardEmail } from 'forwardemail-js';

const client = new ForwardEmail({
  apiKey: import.meta.env.FORWARD_EMAIL_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { to, subject, message } = data;

  if (!to || !subject || !message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    );
  }

  try {
    const result = await client.sendEmail({
      from: import.meta.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text: message,
    });

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
