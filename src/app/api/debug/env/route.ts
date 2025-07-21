import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  const envCheck = {
    database: {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
    },
    email: {
      MAILGUN_API_KEY: process.env.MAILGUN_API_KEY ? 'Set' : 'Not set',
      MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN ? 'Set' : 'Not set',
      SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Not set',
      SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
    },
    sms: {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Not set',
    },
    auth: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }
  };

  return NextResponse.json(
    {
      message: 'Environment variables check',
      timestamp: new Date().toISOString(),
      environment: envCheck
    },
    { status: 200 }
  );
} 