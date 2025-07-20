import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/twilio-service";

/**
 * POST /api/sms/otp/send
 * Send OTP to phone number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required",
        },
        { status: 400 }
      );
    }

    // Format phone number to international format
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0/, '')}`;

    // Send OTP
    const result = await sendOTP(formattedPhone);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "OTP sent successfully",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to send OTP",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("OTP send error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 