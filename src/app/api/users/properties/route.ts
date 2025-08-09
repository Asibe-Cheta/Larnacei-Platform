import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

/**
 * GET /api/users/properties
 * Get current user's properties
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // all, active, pending, rejected
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { ownerId: userId };
    
    if (status && status !== "all") {
      switch (status) {
        case "active":
          where.isActive = true;
          where.moderationStatus = "APPROVED";
          break;
        case "pending":
          where.moderationStatus = "PENDING";
          break;
        case "rejected":
          where.moderationStatus = "REJECTED";
          break;
        case "inactive":
          where.isActive = false;
          break;
      }
    }

    // Fetch user's properties with pagination
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1, // Get only the primary image
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

    // Get summary statistics
    const stats = await prisma.property.groupBy({
      by: ["moderationStatus", "isActive"],
      where: { ownerId: userId },
      _count: {
        id: true,
      },
    });

    const summary = {
      total: total,
      active: stats.find(s => s.isActive && s.moderationStatus === "APPROVED")?._count.id || 0,
      pending: stats.find(s => s.moderationStatus === "PENDING")?._count.id || 0,
      rejected: stats.find(s => s.moderationStatus === "REJECTED")?._count.id || 0,
      inactive: stats.find(s => !s.isActive)?._count.id || 0,
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
    console.error("User properties fetch error:", error);
    
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