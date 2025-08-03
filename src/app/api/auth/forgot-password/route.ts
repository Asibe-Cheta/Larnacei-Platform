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
    console.log('=== FORGOT PASSWORD REQUEST START ===');
    console.log('Request received at:', new Date().toISOString());
    
    const body = await request.json();
    console.log('Request body:', { email: body.email });
    
    const { email } = forgotPasswordSchema.parse(body);
    console.log('Validated email:', email);

    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
      SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
      SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME,
    };
    
    console.log('Environment check:', envCheck);

    // Test database connection first
    console.log('Testing database connection...');
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({
        error: 'Database connection failed. Please try again.'
      }, { status: 500 });
    }

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

    console.log('User found:', { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      hasPassword: !!user.password 
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(16).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    const utcExpiry = new Date(resetTokenExpiry.getTime() - resetTokenExpiry.getTimezoneOffset() * 60000);

    console.log('Generated reset token and updating user record...');

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry: utcExpiry,
        },
      });
      console.log('User record updated successfully');
    } catch (updateError) {
      console.error('Failed to update user record:', updateError);
      return NextResponse.json({
        error: 'Failed to process password reset. Please try again.'
      }, { status: 500 });
    }

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Reset URL generated:', resetUrl);

    // Check if SendGrid is configured
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;

    console.log('Email service configuration:', {
      isDevelopment,
      hasSendGrid,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    });

    // If no SendGrid is configured and we're in production, return success but log the issue
    if (!isDevelopment && !hasSendGrid) {
      console.warn('SendGrid not configured in production. Password reset link:', resetUrl);
      console.warn('This should be configured for production use.');
      
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        warning: 'SendGrid not configured - check server logs for reset link'
      });
    }

    console.log('Attempting to send password reset email...');

    try {
      const emailSent = await sendPasswordResetEmail({
        to: user.email,
        userName: user.name || 'User',
        resetUrl,
        expiryHours: 1,
      });

      if (!emailSent) {
        console.error('Email service returned false - email sending failed');
        
        // In production, we should still return success to prevent email enumeration
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
      console.log('=== FORGOT PASSWORD REQUEST SUCCESS ===');

      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });

    } catch (emailError) {
      console.error('Exception during email sending:', emailError);
      
      if (process.env.NODE_ENV === 'production') {
        console.error('Email exception in production - returning success to prevent enumeration');
        return NextResponse.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      } else {
        return NextResponse.json({
          error: 'Failed to send password reset email. Please try again.',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('=== FORGOT PASSWORD REQUEST ERROR ===');
    console.error('Error:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
} 