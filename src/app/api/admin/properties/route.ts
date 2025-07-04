import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/properties
 * Get properties for admin moderation
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // pending, approved, rejected, all
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== "all") {
      where.moderationStatus = status.toUpperCase();
    }

    // Fetch properties for moderation
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isVerified: true,
              verificationLevel: true,
              role: true,
            },
          },
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
          _count: {
            select: {
              images: true,
              videos: true,
              reviews: true,
              inquiries: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Get moderation statistics
    const stats = await prisma.property.groupBy({
      by: ["moderationStatus"],
      _count: {
        id: true,
      },
    });

    const summary = {
      total: total,
      pending: stats.find(s => s.moderationStatus === "PENDING")?._count.id || 0,
      approved: stats.find(s => s.moderationStatus === "APPROVED")?._count.id || 0,
      rejected: stats.find(s => s.moderationStatus === "REJECTED")?._count.id || 0,
      flagged: stats.find(s => s.moderationStatus === "FLAGGED")?._count.id || 0,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Properties fetched successfully",
        data: properties,
        summary,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin properties fetch error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch properties",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/properties
 * Update property moderation status
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyId, moderationStatus, reason } = body;

    if (!propertyId || !moderationStatus) {
      return NextResponse.json(
        { success: false, message: "Property ID and moderation status are required" },
        { status: 400 }
      );
    }

    // Validate moderation status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "FLAGGED"];
    if (!validStatuses.includes(moderationStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid moderation status" },
        { status: 400 }
      );
    }

    // Update property moderation status
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        moderationStatus,
        isActive: moderationStatus === "APPROVED",
        // Add rejection reason if provided
        ...(moderationStatus === "REJECTED" && reason && { 
          // Note: You might want to add a rejectionReason field to the Property model
        }),
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
      },
    });

    // TODO: Send notification to property owner
    // TODO: Send email notification based on status

    return NextResponse.json(
      {
        success: true,
        message: `Property ${moderationStatus.toLowerCase()} successfully`,
        data: updatedProperty,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Property moderation update error:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update property moderation status",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 