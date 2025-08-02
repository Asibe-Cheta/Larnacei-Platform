import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  const envVars = {
    // Database
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',

    // Email (SendGrid)
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'Set' : 'Not set',
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL ? 'Set' : 'Not set',
    SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME ? 'Set' : 'Not set',

    // SMTP (Fallback)
    SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Not set',
    SMTP_PORT: process.env.SMTP_PORT ? 'Set' : 'Not set',
    SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'Set' : 'Not set',

    // SMS (Twilio)
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Not set',

    // Auth
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',

    // Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set',

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? 'Set' : 'Not set',

    // Redis
    REDIS_URL: process.env.REDIS_URL ? 'Set' : 'Not set',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD ? 'Set' : 'Not set',
    REDIS_DB: process.env.REDIS_DB ? 'Set' : 'Not set',

    // PayStack
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Not set',
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY ? 'Set' : 'Not set',

    // Environment
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  return NextResponse.json({
    message: 'Environment variables status',
    envVars,
    timestamp: new Date().toISOString()
  });
} 