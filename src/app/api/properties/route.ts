import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  propertyCreationApiSchema,
  propertySearchSchema,
  apiResponseSchema,
  paginatedResponseSchema
} from "@/lib/validations";
import { UserRole } from "@prisma/client";
import { cacheManager } from "@/lib/redis";

/**
 * POST /api/properties
 * Create a new property listing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Property creation request received');

    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');

    if (!session?.user?.id) {
      console.log('Authentication failed - no session or user ID');
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log('Validating request data...');

    let validatedData;
    try {
      validatedData = propertyCreationApiSchema.parse(body);
      console.log('Data validation passed');
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
    } catch (validationError: any) {
      console.log('Validation error details:', validationError);
      console.log('Validation error issues:', validationError.issues);

      // Return detailed validation error messages
      const errorMessages = validationError.issues?.map((issue: any) => {
        const field = issue.path.join('.');
        return `${field}: ${issue.message}`;
      }) || [validationError.message];



      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: errorMessages.join(', '),
          details: validationError.issues || [],
        },
        { status: 400 }
      );
    }

    // Create property with owner
    console.log('Creating property in database...');
    
    // Extract images and videos from validated data to handle separately
    const { images, videos, ...propertyData } = validatedData;
    
    const property = await prisma.property.create({
      data: {
        ...propertyData,
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

    console.log('Property created successfully, ID:', property.id);

    // Create property images
    if (validatedData.images && validatedData.images.length > 0) {
      console.log('Creating property images...');
      const imageData = validatedData.images.map((url, index) => ({
        url,
        alt: `Property image ${index + 1}`,
        order: index,
        isPrimary: index === 0,
        propertyId: property.id,
      }));

      await prisma.propertyImage.createMany({
        data: imageData,
      });
      console.log('Property images created');
    }

    // Create property videos
    if (validatedData.videos && validatedData.videos.length > 0) {
      console.log('Creating property videos...');
      await prisma.propertyVideo.createMany({
        data: validatedData.videos.map((url, index) => ({
          url,
          title: `Property video ${index + 1}`,
          propertyId: property.id,
        })),
      });
      console.log('Property videos created');
    }

    // Clear property caches when new property is created
    try {
      await cacheManager.clearPropertyCaches();
      console.log('Property caches cleared');
    } catch (cacheError) {
      console.warn('Failed to clear property caches:', cacheError);
    }

    console.log('Property creation completed successfully');
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
      console.log('Validation error:', error.errors);
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: error.errors.map((e: any) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error.code) {
      console.log('Prisma error code:', error.code);
      switch (error.code) {
        case 'P2002':
          return NextResponse.json(
            {
              success: false,
              message: "Property with this information already exists",
              error: "Duplicate property",
            },
            { status: 409 }
          );
        case 'P2003':
          return NextResponse.json(
            {
              success: false,
              message: "Invalid reference data",
              error: "Foreign key constraint failed",
            },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            {
              success: false,
              message: "Database error occurred",
              error: error.message,
            },
            { status: 500 }
          );
      }
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

    // Generate cache key based on search parameters
    const cacheKey = `search:${JSON.stringify(validatedParams)}`;

    // Try to get cached results first
    const cachedResults = await cacheManager.getSearchResults(cacheKey);
    if (cachedResults) {
      return NextResponse.json(cachedResults, { status: 200 });
    }

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

    const response = {
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
    };

    // Cache the results
    await cacheManager.setSearchResults(cacheKey, response);

    return NextResponse.json(response, { status: 200 });
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