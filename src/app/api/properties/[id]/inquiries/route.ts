import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { propertyInquirySchema } from "@/lib/validations";
import { InquiryType } from "@prisma/client";

/**
 * POST /api/properties/[id]/inquiries
 * Create a property inquiry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: propertyId } = params;

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

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true, ownerId: true, isActive: true },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    if (!property.isActive) {
      return NextResponse.json(
        { success: false, message: "Property is not available for inquiries" },
        { status: 400 }
      );
    }

    // Prevent users from inquiring about their own properties
    if (property.ownerId === userId) {
      return NextResponse.json(
        { success: false, message: "You cannot inquire about your own property" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = propertyInquirySchema.parse(body);

    // Create inquiry
    const inquiry = await prisma.propertyInquiry.create({
      data: {
        message: validatedData.message,
        inquiryType: validatedData.inquiryType as InquiryType,
        contactPreference: validatedData.contactPreference,
        intendedUse: validatedData.intendedUse,
        budget: validatedData.budget,
        timeframe: validatedData.timeframe,
        financingNeeded: validatedData.financingNeeded,
        propertyId,
        inquirerId: userId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            currency: true,
          },
        },
        inquirer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Increment inquiry count on property
    await prisma.property.update({
      where: { id: propertyId },
      data: { inquiryCount: { increment: 1 } },
    });

    // TODO: Send notification to property owner
    // TODO: Send confirmation email to inquirer

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry sent successfully",
        data: inquiry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Property inquiry error:", error);
    
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
        message: "Failed to send inquiry",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/properties/[id]/inquiries
 * Get inquiries for a property (owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: propertyId } = params;

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

    // Validate property exists and user owns it
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, ownerId: true },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    if (property.ownerId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to view these inquiries" },
        { status: 403 }
      );
    }

    // Get inquiries with pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      prisma.propertyInquiry.findMany({
        where: { propertyId },
        include: {
          inquirer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isVerified: true,
              verificationLevel: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.propertyInquiry.count({ where: { propertyId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        message: "Inquiries fetched successfully",
        data: inquiries,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Property inquiries fetch error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inquiries",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 