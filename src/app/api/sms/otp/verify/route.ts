import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/twilio-service";

/**
 * POST /api/sms/otp/verify
 * Verify OTP sent to phone number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and OTP are required",
        },
        { status: 400 }
      );
    }

    // Format phone number to international format
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0/, '')}`;

    // Verify OTP
    const isValid = verifyOTP(formattedPhone, otp);

    if (isValid) {
      return NextResponse.json(
        {
          success: true,
          message: "OTP verified successfully",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP or OTP has expired",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("OTP verification error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify OTP",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 