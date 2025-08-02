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
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate a shorter token (16 bytes = 32 hex characters) to avoid URL truncation
    const resetToken = crypto.randomBytes(16).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    // Ensure we're using UTC time to avoid timezone issues
    const utcExpiry = new Date(resetTokenExpiry.getTime() - resetTokenExpiry.getTimezoneOffset() * 60000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: utcExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      userName: user.name || 'User',
      resetUrl,
      expiryHours: 1,
    });

    if (!emailSent) {
      return NextResponse.json({
        error: 'Failed to send password reset email. Please try again.'
      }, { status: 500 });
    }

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