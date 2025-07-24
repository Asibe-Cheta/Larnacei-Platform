import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      configured: !!process.env.DATABASE_URL,
      connected: false,
      error: null
    },
    services: {
      email: {
        sendgrid: !!(process.env.SENDGRID_API_KEY),
        smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
      },
      sms: {
        twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
      }
    }
  };

  // Test database connection
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$connect();
      const userCount = await prisma.user.count();
      health.database.connected = true;
      health.database.userCount = userCount;
      await prisma.$disconnect();
    } catch (error) {
      health.database.connected = false;
      health.database.error = error instanceof Error ? error.message : 'Unknown error';
      health.status = 'error';
    }
  } else {
    health.database.error = 'DATABASE_URL not configured';
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
} 