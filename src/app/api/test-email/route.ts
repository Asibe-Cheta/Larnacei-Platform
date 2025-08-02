import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('Test email endpoint called');

    // Check environment variables
    const envCheck = {
      SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
    };

    console.log('Environment check:', envCheck);

    // Test email sending
    const testData = {
      to: 'test@example.com',
      userName: 'Test User',
      resetUrl: 'https://properties.larnaceiglobal.com/reset-password?token=test',
      expiryHours: 1
    };

    console.log('Attempting to send test email...');
    const emailSent = await sendPasswordResetEmail(testData);

    return NextResponse.json({
      success: emailSent,
      environment: envCheck,
      message: emailSent ? 'Test email sent successfully' : 'Test email failed'
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
        SMTP_HOST: !!process.env.SMTP_HOST,
        SMTP_USER: !!process.env.SMTP_USER,
        SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }
    }, { status: 500 });
  }
} 