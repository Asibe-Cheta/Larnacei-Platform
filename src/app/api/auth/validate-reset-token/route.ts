import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('=== VALIDATE RESET TOKEN START ===');
    console.log('Token:', token);
    console.log('Current time:', new Date().toISOString());

    if (!token) {
      console.log('No token provided');
      return NextResponse.json({
        valid: false,
        error: 'Reset token is required'
      }, { status: 400 });
    }

    // Find user with valid reset token
    // Use the same time format as stored in database
    const currentTime = new Date();

    console.log('Searching for user with token and expiry >', currentTime.toISOString());

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
        resetTokenExpiry: true,
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
        console.log('Current time is:', currentTime.toISOString());
        console.log('Time difference (minutes):', expiredUser.resetTokenExpiry ? 
          Math.round((currentTime.getTime() - expiredUser.resetTokenExpiry.getTime()) / (1000 * 60)) : 'N/A');
      }

      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired reset token'
      }, { status: 400 });
    }

    console.log('Valid user found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      expiry: user.resetTokenExpiry?.toISOString()
    });
    console.log('Time until expiry (minutes):', user.resetTokenExpiry ? 
      Math.round((user.resetTokenExpiry.getTime() - currentTime.getTime()) / (1000 * 60)) : 'N/A');
    console.log('=== VALIDATE RESET TOKEN SUCCESS ===');

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
      }
    });

  } catch (error) {
    console.error('=== VALIDATE RESET TOKEN ERROR ===');
    console.error('Validate reset token error:', error);

    return NextResponse.json({
      valid: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 