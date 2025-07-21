import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, validateWorldwidePhone } from '@/lib/twilio-service';
import { z } from 'zod';

interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

interface VerifyOTPError {
  message: string;
  field?: string;
}

const verifyOTPSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  otp: z.string().min(4, 'OTP must be at least 4 digits').max(6, 'OTP must be at most 6 digits')
});

export async function POST(request: NextRequest) {
  try {
    let body: VerifyOTPRequest;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = verifyOTPSchema.safeParse(body);
    if (!validationResult.success) {
      const errors: VerifyOTPError[] = validationResult.error.errors.map(err => ({
        message: err.message,
        field: err.path.join('.')
      }));
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { phone, otp } = validationResult.data;

    // Validate phone number format
    const phoneValidation = validateWorldwidePhone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    // Verify OTP
    const result = await verifyOTP(phoneValidation.formatted, otp);

    if (result.success) {
      return NextResponse.json({
        message: 'OTP verified successfully',
        phone: phoneValidation.formatted
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Invalid OTP' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
} 