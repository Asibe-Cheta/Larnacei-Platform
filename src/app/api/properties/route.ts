import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  propertyCreationSchema, 
  propertySearchSchema,
  apiResponseSchema,
  paginatedResponseSchema 
} from "@/lib/validations";
import { UserRole } from "@prisma/client";

/**
 * POST /api/properties
 * Create a new property listing
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = propertyCreationSchema.parse(body);

    // Create property with owner
    const property = await prisma.property.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        // Set initial status based on user role
        isActive: session.user.role === UserRole.ADMIN || session.user.role === UserRole.SUPER_ADMIN,
        moderationStatus: session.user.role === UserRole.ADMIN || session.user.role === UserRole.SUPER_ADMIN 
          ? "APPROVED" 
          : "PENDING",
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

    // Create property images
    if (validatedData.images && validatedData.images.length > 0) {
      await prisma.propertyImage.createMany({
        data: validatedData.images.map((url, index) => ({
          url,
          alt: `Property image ${index + 1}`,
          order: index,
          isPrimary: index === 0,
          propertyId: property.id,
        })),
      });
    }

    // Create property videos
    if (validatedData.videos && validatedData.videos.length > 0) {
      await prisma.propertyVideo.createMany({
        data: validatedData.videos.map((url, index) => ({
          url,
          title: `Property video ${index + 1}`,
          propertyId: property.id,
        })),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Property created successfully",
        data: property,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Property creation error:", error);
    
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
        message: "Failed to create property",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/properties
 * Fetch properties with search and filter functionality
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      query: searchParams.get("query") || undefined,
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      purpose: searchParams.get("purpose") || undefined,
      state: searchParams.get("state") || undefined,
      city: searchParams.get("city") || undefined,
      minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
      bedrooms: searchParams.get("bedrooms") ? parseInt(searchParams.get("bedrooms")!) : undefined,
      bathrooms: searchParams.get("bathrooms") ? parseInt(searchParams.get("bathrooms")!) : undefined,
      condition: searchParams.get("condition") || undefined,
      furnishingStatus: searchParams.get("furnishingStatus") || undefined,
      availabilityStatus: searchParams.get("availabilityStatus") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const validatedParams = propertySearchSchema.parse(queryParams);

    // Build filter conditions
    const where: any = {
      isActive: true,
      moderationStatus: "APPROVED",
    };

    // Text search
    if (validatedParams.query) {
      where.OR = [
        { title: { contains: validatedParams.query, mode: "insensitive" } },
        { description: { contains: validatedParams.query, mode: "insensitive" } },
        { location: { contains: validatedParams.query, mode: "insensitive" } },
        { city: { contains: validatedParams.query, mode: "insensitive" } },
        { state: { contains: validatedParams.query, mode: "insensitive" } },
      ];
    }

    // Property type filters
    if (validatedParams.type) where.type = validatedParams.type;
    if (validatedParams.category) where.category = validatedParams.category;
    if (validatedParams.purpose) where.purpose = validatedParams.purpose;
    if (validatedParams.condition) where.condition = validatedParams.condition;
    if (validatedParams.furnishingStatus) where.furnishingStatus = validatedParams.furnishingStatus;
    if (validatedParams.availabilityStatus) where.availabilityStatus = validatedParams.availabilityStatus;

    // Location filters
    if (validatedParams.state) where.state = { contains: validatedParams.state, mode: "insensitive" };
    if (validatedParams.city) where.city = { contains: validatedParams.city, mode: "insensitive" };

    // Price range
    if (validatedParams.minPrice || validatedParams.maxPrice) {
      where.price = {};
      if (validatedParams.minPrice) where.price.gte = validatedParams.minPrice;
      if (validatedParams.maxPrice) where.price.lte = validatedParams.maxPrice;
    }

    // Bedrooms and bathrooms
    if (validatedParams.bedrooms !== undefined) where.bedrooms = validatedParams.bedrooms;
    if (validatedParams.bathrooms !== undefined) where.bathrooms = validatedParams.bathrooms;

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Build order by
    const orderBy: any = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

    // Fetch properties with pagination
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
            },
          },
          images: {
            orderBy: { order: "asc" },
            take: 1, // Get only the primary image for listing
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
        orderBy,
        skip,
        take: validatedParams.limit,
      }),
      prisma.property.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / validatedParams.limit);
    const hasNext = validatedParams.page < totalPages;
    const hasPrev = validatedParams.page > 1;

    return NextResponse.json(
      {
        success: true,
        message: "Properties fetched successfully",
        data: properties,
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Property fetch error:", error);
    
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
        message: "Failed to fetch properties",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 