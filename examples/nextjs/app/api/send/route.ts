import { NextResponse } from 'next/server';
import { emailClient } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text, html } = body;

    // Basic validation
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send the email
    const result = await emailClient.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      status: result.status,
    });
  } catch (error: any) {
    console.error('Failed to send email:', error);

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
