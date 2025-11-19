import { ForwardEmail } from 'forwardemail-js';

const client = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY || '',
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { to, subject, message } = body;

  if (!to || !subject || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    });
  }

  try {
    const result = await client.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text: message,
    });

    return { success: true, id: result.id };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
