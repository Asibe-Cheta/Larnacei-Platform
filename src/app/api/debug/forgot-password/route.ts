import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug forgot password endpoint called');

    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
      SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
      SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
    };

    console.log('Environment check:', envCheck);

    // Test database connection
    let dbStatus = 'Unknown';
    let userCount = 0;
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      userCount = await prisma.user.count();
      dbStatus = 'Connected';
    } catch (dbError) {
      dbStatus = 'Failed';
      console.error('Database connection failed:', dbError);
    }

    // Test email service
    let emailStatus = 'Not Tested';
    try {
      const testData = {
        to: 'test@example.com',
        userName: 'Test User',
        resetUrl: 'https://example.com/reset?token=test',
        expiryHours: 1
      };

      const emailSent = await sendPasswordResetEmail(testData);
      emailStatus = emailSent ? 'Success' : 'Failed';
    } catch (emailError) {
      emailStatus = 'Error';
      console.error('Email test failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      debug: {
        environment: envCheck,
        database: {
          status: dbStatus,
          userCount
        },
        email: {
          status: emailStatus
        },
        recommendations: {
          development: process.env.NODE_ENV === 'development' ? 'Check console logs for reset links' : null,
          production: process.env.NODE_ENV === 'production' ? 'Configure SendGrid or SMTP for email sending' : null,
          sendgrid: !process.env.SENDGRID_API_KEY ? 'Add SENDGRID_API_KEY environment variable' : null,
          smtp: !process.env.SMTP_USER || !process.env.SMTP_HOST ? 'Add SMTP_USER and SMTP_HOST environment variables' : null
        }
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 