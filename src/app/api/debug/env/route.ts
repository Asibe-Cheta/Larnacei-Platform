import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/debug/env
 * Debug endpoint to check environment variables (development only)
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const envCheck = {
    // Database
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    
    // NextAuth
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    
    // Mailgun
    MAILGUN_API_KEY: !!process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: !!process.env.MAILGUN_DOMAIN,
    MAILGUN_WEBHOOK_SECRET: !!process.env.MAILGUN_WEBHOOK_SECRET,
    
    // SMTP (fallback)
    SMTP_HOST: !!process.env.SMTP_HOST,
    SMTP_PORT: !!process.env.SMTP_PORT,
    SMTP_USER: !!process.env.SMTP_USER,
    SMTP_PASS: !!process.env.SMTP_PASS,
    
    // Twilio
    TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: !!process.env.TWILIO_PHONE_NUMBER,
    
    // Google OAuth
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  };

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    envCheck,
    missing: Object.entries(envCheck)
      .filter(([key, value]) => !value)
      .map(([key]) => key)
  });
} 