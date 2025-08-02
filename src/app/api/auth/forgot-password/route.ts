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
    console.log('Request body:', { email: body.email });

    const { email } = forgotPasswordSchema.parse(body);
    console.log('Validated email:', email);

    // Check if user exists
    console.log('Checking if user exists...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('User not found, returning success message');
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    console.log('User found:', { id: user.id, email: user.email });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    console.log('Generated reset token, expiry:', resetTokenExpiry);

    // Save reset token to database
    console.log('Saving reset token to database...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
    console.log('Reset token saved successfully');

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Reset URL generated:', resetUrl);

    console.log('Attempting to send password reset email...');
    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      userName: user.name || user.firstName || 'User',
      resetUrl,
      expiryHours: 1,
    });

    if (!emailSent) {
      console.error('Failed to send password reset email');
      return NextResponse.json({
        error: 'Failed to send password reset email. Please try again.'
      }, { status: 500 });
    }

    console.log('Password reset email sent successfully');
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 });
    }

    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
} 