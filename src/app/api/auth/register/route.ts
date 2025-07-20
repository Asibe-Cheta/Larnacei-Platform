import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userRegistrationSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email-service";
import { sendOTP } from "@/lib/twilio-service";

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }
    
    // Handle form data structure (firstName + lastName = name)
    let registrationData = body;
    if (body.firstName && body.lastName) {
      registrationData = {
        name: `${body.firstName} ${body.lastName}`.trim(),
        email: body.email,
        phone: body.phone,
        password: body.password,
        role: body.role || "SEEKER",
        accountType: body.accountType || "INDIVIDUAL",
      };
    }

    // Validate request body
    const validatedData = userRegistrationSchema.parse(registrationData);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email or phone number already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        role: validatedData.role,
        accountType: validatedData.accountType,
        // Set initial verification status
        isVerified: false,
        verificationLevel: "NONE",
        kycStatus: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        accountType: true,
        isVerified: true,
        verificationLevel: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    try {
      // Send email verification
      await sendVerificationEmail(user.email, user.name, user.id);
      
      // Send OTP to phone number
      await sendOTP(user.phone);
      
      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully. Please check your email and phone for verification codes.",
          data: user,
        },
        { status: 201 }
      );
    } catch (emailError) {
      console.error("Email/SMS sending error:", emailError);
      
      // User was created but email/SMS failed - still return success
      // but with a warning
      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully. Verification emails/SMS may be delayed.",
          data: user,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("User registration error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: error.errors.map((e: any) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email or phone number already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to register user",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 