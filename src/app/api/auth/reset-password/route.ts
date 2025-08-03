import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== RESET PASSWORD START ===');
    
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    console.log('Reset password request for token:', token);
    console.log('Current time:', new Date().toISOString());

    // Find user with valid reset token
    // Use current time for comparison
    const currentTime = new Date();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: currentTime,
        },
      },
    });

    if (!user) {
      console.log('No valid user found with this token');
      
      // Check if user exists but token is expired
      const expiredUser = await prisma.user.findFirst({
        where: {
          resetToken: token,
        },
        select: {
          resetTokenExpiry: true,
        },
      });

      if (expiredUser) {
        console.log('User found but token expired. Expiry was:', expiredUser.resetTokenExpiry?.toISOString());
      }

      return NextResponse.json({
        error: 'Invalid or expired reset token. Please request a new password reset.'
      }, { status: 400 });
    }

    console.log('Valid user found, updating password...');

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log('Password reset successful for user:', user.email);
    console.log('=== RESET PASSWORD SUCCESS ===');

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.'
    });

  } catch (error) {
    console.error('=== RESET PASSWORD ERROR ===');
    console.error('Reset password error:', error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0]?.message || 'Invalid request data';
      return NextResponse.json({
        error: errorMessage
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
} 