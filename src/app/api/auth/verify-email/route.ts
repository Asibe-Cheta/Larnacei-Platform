import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/verify-email
 * Verify user email address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification token is required",
        },
        { status: 400 }
      );
    }

    // Find user by ID (token is the user ID)
    const user = await prisma.user.findUnique({
      where: { id: token },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification token",
        },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email is already verified",
        },
        { status: 200 }
      );
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: token },
      data: {
        isVerified: true,
        verificationLevel: "EMAIL_VERIFIED",
        emailVerified: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify email",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 