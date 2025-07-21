import { NextRequest, NextResponse } from 'next/server';
import { sendOTP, validateWorldwidePhone } from '@/lib/twilio-service';
import { z } from 'zod';

interface SendOTPRequest {
  phone: string;
}

interface SendOTPError {
  message: string;
  field?: string;
}

const sendOTPSchema = z.object({
  phone: z.string().min(1, 'Phone number is required')
});

export async function POST(request: NextRequest) {
  try {
    let body: SendOTPRequest;
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
    const validationResult = sendOTPSchema.safeParse(body);
    if (!validationResult.success) {
      const errors: SendOTPError[] = validationResult.error.errors.map(err => ({
        message: err.message,
        field: err.path.join('.')
      }));
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { phone } = validationResult.data;

    // Validate phone number format
    const phoneValidation = validateWorldwidePhone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    // Send OTP
    const result = await sendOTP(phoneValidation.formatted);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      phone: phoneValidation.formatted
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
} 