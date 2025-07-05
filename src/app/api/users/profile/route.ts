import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userProfileUpdateSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

/**
 * GET /api/users/profile
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found" },
        { status: 401 }
      );
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        accountType: true,
        isVerified: true,
        verificationLevel: true,
        kycStatus: true,
        bio: true,
        location: true,
        experience: true,
        specialization: true,
        socialLinks: true,
        contactPreference: true,
        availabilityHours: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            bookings: true,
            reviews: true,
            inquiries: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile fetched successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = userProfileUpdateSchema.parse(body);

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
        // If socialLinks is present, store as JSON
        socialLinks: validatedData.socialLinks ? validatedData.socialLinks : undefined,
        // If specialization is present as a string, convert to array
        specialization: validatedData.specialization,
        // Notification and privacy fields
        emailNotifications: validatedData.emailNotifications,
        smsNotifications: validatedData.smsNotifications,
        profileVisibility: validatedData.profileVisibility,
        showContactInfo: validatedData.showContactInfo,
        // Address and professional info
        streetAddress: validatedData.streetAddress,
        city: validatedData.city,
        state: validatedData.state,
        lga: validatedData.lga,
        businessName: validatedData.businessName,
        cacNumber: validatedData.cacNumber,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        accountType: true,
        isVerified: true,
        verificationLevel: true,
        kycStatus: true,
        bio: true,
        location: true,
        experience: true,
        specialization: true,
        socialLinks: true,
        contactPreference: true,
        availabilityHours: true,
        updatedAt: true,
        streetAddress: true,
        city: true,
        state: true,
        lga: true,
        businessName: true,
        cacNumber: true,
        emailNotifications: true,
        smsNotifications: true,
        profileVisibility: true,
        showContactInfo: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile update error:", error);
    
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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/profile
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current and new password are required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "User not found or password not set" },
        { status: 404 }
      );
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to change password", error: error.message },
      { status: 500 }
    );
  }
} 