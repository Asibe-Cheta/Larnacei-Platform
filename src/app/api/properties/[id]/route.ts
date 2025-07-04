import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/properties/[id]
 * Get property details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    // Fetch property with all related data
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            accountType: true,
            isVerified: true,
            verificationLevel: true,
            location: true,
            experience: true,
            specialization: true,
            contactPreference: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        videos: true,
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            images: true,
            videos: true,
            reviews: true,
            inquiries: true,
            favorites: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    // Only return active and approved properties (unless admin)
    if (!property.isActive || property.moderationStatus !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Property not available" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.property.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Property details fetched successfully",
        data: property,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Property fetch error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch property details",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/properties/[id]
 * Update property details (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if property exists and get current data
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    // TODO: Add authentication check for property owner
    // For now, allow updates (will be implemented with NextAuth)

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...body,
        // Reset moderation status if significant changes are made
        moderationStatus: "PENDING",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        images: true,
        videos: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Property updated successfully",
        data: updatedProperty,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Property update error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update property",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete property (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    // TODO: Add authentication check for property owner
    // For now, allow deletion (will be implemented with NextAuth)

    // Delete property (cascade will handle related records)
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Property deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Property deletion error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete property",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 