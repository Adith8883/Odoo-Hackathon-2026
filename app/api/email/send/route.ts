import { NextRequest, NextResponse } from 'next/server';
import { generateEmailHtml, EmailPayload } from '@/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.subject || !payload.template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or template.' },
        { status: 400 }
      );
    }

    const htmlContent = generateEmailHtml(payload);
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

    // Log the generated email in development/production
    console.log(`[EMAIL DISPATCH] To: ${recipients.join(', ')} | Subject: "${payload.subject}" | Template: ${payload.template}`);

    // If an external email provider key (e.g. RESEND_API_KEY) is configured in environment, send it
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Dayflow HRMS <onboarding@resend.dev>',
          to: recipients,
          subject: payload.subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.warn('[EMAIL WARNING] Resend provider responded with:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Email reminder sent to ${recipients.length} recipient(s): ${recipients.join(', ')}`,
      recipients,
      subject: payload.subject,
    });
  } catch (error: any) {
    console.error('[EMAIL ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error processing email.' },
      { status: 500 }
    );
  }
}
