import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email-service';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Forgot password request received');
    
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    console.log('Processing forgot password for email:', email);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    console.log('User found:', { id: user.id, name: user.name, email: user.email });

    // Generate a shorter token (16 bytes = 32 hex characters) to avoid URL truncation
    const resetToken = crypto.randomBytes(16).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    // Ensure we're using UTC time to avoid timezone issues
    const utcExpiry = new Date(resetTokenExpiry.getTime() - resetTokenExpiry.getTimezoneOffset() * 60000);

    console.log('Generated reset token and updating user record');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: utcExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('Reset URL generated:', resetUrl);

    // Check if we're in development mode or if email services are configured
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;
    const hasNodemailer = !!(process.env.SMTP_USER && process.env.SMTP_HOST);

    console.log('Email configuration check:', {
      isDevelopment,
      hasSendGrid,
      hasNodemailer,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    });

    // If no email services are configured and we're in production, return success but log the issue
    if (!isDevelopment && !hasSendGrid && !hasNodemailer) {
      console.warn('No email services configured in production. Password reset link:', resetUrl);
      console.warn('This should be configured for production use.');
      
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        warning: 'Email services not configured - check server logs for reset link'
      });
    }

    console.log('Attempting to send password reset email...');

    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      userName: user.name || 'User',
      resetUrl,
      expiryHours: 1,
    });

    if (!emailSent) {
      console.error('Failed to send password reset email for user:', user.email);
      
      // In production, we should still return success to prevent email enumeration
      // but log the issue for debugging
      if (process.env.NODE_ENV === 'production') {
        console.error('Password reset email failed but returning success to prevent email enumeration');
        return NextResponse.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      } else {
        return NextResponse.json({
          error: 'Failed to send password reset email. Please try again.'
        }, { status: 500 });
      }
    }

    console.log('Password reset email sent successfully for user:', user.email);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
} 