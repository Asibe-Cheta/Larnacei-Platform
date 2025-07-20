import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/twilio-service';
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

    // Send OTP
    await sendOTP(phone);

    return NextResponse.json({
      message: 'OTP sent successfully',
      phone: phone
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
} 