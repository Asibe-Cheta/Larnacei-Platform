import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { z } from "zod";

const inquiryFilterSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default("10"),
  status: z.enum(["NEW", "RESPONDED", "IN_PROGRESS", "CLOSED", "SPAM", "all"]).optional(),
  propertyId: z.string().optional(),
  inquiryType: z.enum(["GENERAL_INFO", "VIEWING_REQUEST", "PRICE_INQUIRY", "PURCHASE_INTENT", "RENTAL_APPLICATION", "INVESTMENT_INQUIRY", "OTHER"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(["createdAt", "status", "inquiryType"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * GET /api/inquiries
 * Get all inquiries for property owner with filtering and pagination
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedParams = inquiryFilterSchema.parse(queryParams);

    // Get user's properties
    const userProperties = await prisma.property.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const propertyIds = userProperties.map(p => p.id);

    if (propertyIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No inquiries found",
          data: [],
          pagination: {
            page: validatedParams.page,
            limit: validatedParams.limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          summary: {
            total: 0,
            new: 0,
            responded: 0,
            inProgress: 0,
            closed: 0,
            spam: 0,
          },
        },
        { status: 200 }
      );
    }

    // Build where clause
    const where: any = {
      propertyId: { in: propertyIds },
    };

    if (validatedParams.status && validatedParams.status !== "all") {
      where.status = validatedParams.status;
    }

    if (validatedParams.propertyId) {
      where.propertyId = validatedParams.propertyId;
    }

    if (validatedParams.inquiryType) {
      where.inquiryType = validatedParams.inquiryType;
    }

    if (validatedParams.dateFrom || validatedParams.dateTo) {
      where.createdAt = {};
      if (validatedParams.dateFrom) {
        where.createdAt.gte = new Date(validatedParams.dateFrom);
      }
      if (validatedParams.dateTo) {
        where.createdAt.lte = new Date(validatedParams.dateTo + "T23:59:59.999Z");
      }
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Build order by
    const orderBy: any = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

    // Fetch inquiries with pagination
    const [inquiries, total] = await Promise.all([
      prisma.propertyInquiry.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              city: true,
              state: true,
              price: true,
              currency: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
          conversation: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { content: true, createdAt: true },
              },
            },
          },
        },
        orderBy,
        skip,
        take: validatedParams.limit,
      }),
      prisma.propertyInquiry.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / validatedParams.limit);
    const hasNext = validatedParams.page < totalPages;
    const hasPrev = validatedParams.page > 1;

    // Get summary statistics
    const statusStats = await prisma.propertyInquiry.groupBy({
      by: ["status"],
      where: { propertyId: { in: propertyIds } },
      _count: { id: true },
    });

    const summary = {
      total,
      new: statusStats.find(s => s.status === "NEW")?._count.id || 0,
      responded: statusStats.find(s => s.status === "RESPONDED")?._count.id || 0,
      inProgress: statusStats.find(s => s.status === "IN_PROGRESS")?._count.id || 0,
      closed: statusStats.find(s => s.status === "CLOSED")?._count.id || 0,
      spam: statusStats.find(s => s.status === "SPAM")?._count.id || 0,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Inquiries fetched successfully",
        data: inquiries,
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
        summary,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Inquiries fetch error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          error: error.errors.map((e: any) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

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

/**
 * PUT /api/inquiries
 * Bulk update inquiry statuses
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

    const body = await request.json();
    const { inquiryIds, status } = body;

    if (!inquiryIds || !Array.isArray(inquiryIds) || inquiryIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Inquiry IDs are required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    // Verify user owns the properties for these inquiries
    const userProperties = await prisma.property.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const propertyIds = userProperties.map(p => p.id);

    // Update inquiries
    const result = await prisma.propertyInquiry.updateMany({
      where: {
        id: { in: inquiryIds },
        propertyId: { in: propertyIds },
      },
      data: { status },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${result.count} inquiries updated successfully`,
        data: { updatedCount: result.count },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Bulk inquiry update error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update inquiries",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 