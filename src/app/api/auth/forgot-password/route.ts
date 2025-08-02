import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email-service';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  console.log('=== FORGOT PASSWORD ENDPOINT CALLED ===');

  try {
    console.log('1. Parsing request body...');
    const body = await request.json();
    console.log('2. Request body:', body);

    console.log('3. Validating email with Zod...');
    const { email } = forgotPasswordSchema.parse(body);
    console.log('4. Email validated:', email);

    console.log('5. Checking if user exists...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    console.log('6. User lookup result:', user ? 'Found' : 'Not found');

    if (!user) {
      console.log('7. User not found, returning success');
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    console.log('8. User found, generating reset token...');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    console.log('9. Reset token generated, expiry:', resetTokenExpiry);

    console.log('10. Saving reset token to database...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
    console.log('11. Reset token saved successfully');

    console.log('12. Generating reset URL...');
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('13. Reset URL generated:', resetUrl);

    console.log('14. Sending password reset email...');
    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      userName: user.name || user.firstName || 'User',
      resetUrl,
      expiryHours: 1,
    });

    console.log('15. Email sent result:', emailSent);

    if (!emailSent) {
      console.error('16. Failed to send password reset email');
      return NextResponse.json({
        error: 'Failed to send password reset email. Please try again.'
      }, { status: 500 });
    }

    console.log('17. Password reset process completed successfully');
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('=== FORGOT PASSWORD ERROR ===');
    console.error('Error:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 });
    }

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