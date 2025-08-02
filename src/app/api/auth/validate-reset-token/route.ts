import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        valid: false,
        error: 'Reset token is required'
      }, { status: 400 });
    }

    // Find user with valid reset token
    // Use UTC time for comparison to avoid timezone issues
    const currentTime = new Date();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: currentTime,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired reset token'
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
      }
    });

  } catch (error) {
    console.error('Validate reset token error:', error);

    return NextResponse.json({
      valid: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 