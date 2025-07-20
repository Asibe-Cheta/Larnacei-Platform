import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface VerifyEmailRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    let body: VerifyEmailRequest;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerified: false
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired (24 hours)
    const tokenCreatedAt = user.emailVerificationTokenCreatedAt;
    if (tokenCreatedAt) {
      const now = new Date();
      const tokenAge = now.getTime() - tokenCreatedAt.getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (tokenAge > maxAge) {
        return NextResponse.json(
          { error: 'Verification token has expired' },
          { status: 400 }
        );
      }
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenCreatedAt: null,
        verificationLevel: 'EMAIL_VERIFIED'
      }
    });

    return NextResponse.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
        verificationLevel: 'EMAIL_VERIFIED'
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 