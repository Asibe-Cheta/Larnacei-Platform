import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOTP } from '@/lib/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP with Twilio
    const verificationResult = await verifyOTP(phone, otp);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: {
        phone: phone,
        phoneVerified: false
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or phone already verified' },
        { status: 400 }
      );
    }

    // Update user phone verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        verificationLevel: user.isVerified ? 'FULL_VERIFIED' : 'PHONE_VERIFIED'
      }
    });

    return NextResponse.json({
      message: 'Phone number verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        phoneVerified: true,
        verificationLevel: user.isVerified ? 'FULL_VERIFIED' : 'PHONE_VERIFIED'
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'OTP verification failed' },
      { status: 500 }
    );
  }
} 