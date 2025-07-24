import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/sendgrid-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Send test email
    const success = await sendTestEmail(email);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        email: email
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send test email',
        email: email
      }, { status: 500 });
    }

  } catch (error) {
    console.error('SendGrid test error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SendGrid Test API',
    endpoints: {
      POST: 'Send a test email to verify SendGrid integration'
    },
    environment: {
      sendgridConfigured: !!process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'info@larnaceiglobal.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'Larnacei Property Platform'
    }
  });
} 