import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/properties
 * Get properties for admin moderation
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      // Only get properties that are admin-managed (demo, featured, partner, showcase)
      OR: [
        { isDemo: true },
        { isFeatured: true },
        { isPartnerProperty: true },
        { isShowcase: true }
      ]
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      switch (type) {
        case 'demo':
          where.isDemo = true;
          break;
        case 'featured':
          where.isFeatured = true;
          break;
        case 'partner':
          where.isPartnerProperty = true;
          break;
        case 'showcase':
          where.isShowcase = true;
          break;
      }
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (category) {
      where.category = category.toUpperCase();
    }

    // Get properties with related data
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              isPrimary: true
            },
            orderBy: { isPrimary: 'desc' }
          },
          inquiries: {
            select: { id: true }
          },
          bookings: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ]);

    // Transform data for admin interface
    const transformedProperties = properties.map(property => {
      const primaryImage = property.images.find(img => img.isPrimary)?.url || 
                          property.images[0]?.url || '/images/placeholder.jpg';

      // Determine property type based on flags
      let propertyType = 'regular';
      if (property.isDemo) propertyType = 'demo';
      else if (property.isFeatured) propertyType = 'featured';
      else if (property.isPartnerProperty) propertyType = 'partner';
      else if (property.isShowcase) propertyType = 'showcase';

      return {
        id: property.id,
        title: property.title,
        location: property.location,
        price: property.price,
        currency: property.currency,
        category: property.category,
        type: propertyType,
        status: property.status.toLowerCase(),
        views: property.views || 0,
        inquiries: property.inquiries.length,
        bookings: property.bookings.length,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString(),
        image: primaryImage,
        owner: property.owner,
        description: property.description,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        areaUnit: property.areaUnit,
        isVerified: property.isVerified,
        isApproved: property.isApproved,
        isActive: property.isActive
      };
    });

    return NextResponse.json({
      properties: transformedProperties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Admin properties API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

// POST /api/admin/properties - Create new admin property
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      price,
      currency,
      category,
      bedrooms,
      bathrooms,
      area,
      areaUnit,
      type, // demo, featured, partner, showcase
      ownerId
    } = body;

    // Validate required fields
    if (!title || !location || !price || !category || !type || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Set property flags based on type
    const propertyData: any = {
      title,
      description,
      location,
      price: parseFloat(price),
      currency: currency || 'NGN',
      category: category.toUpperCase(),
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      area: area ? parseFloat(area) : null,
      areaUnit: areaUnit || 'sqft',
      ownerId,
      status: 'ACTIVE',
      isVerified: true,
      isApproved: true,
      isActive: true,
      isDemo: type === 'demo',
      isFeatured: type === 'featured',
      isPartnerProperty: type === 'partner',
      isShowcase: type === 'showcase'
    };

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Property created successfully',
      property
    });

  } catch (error) {
    console.error('Create admin property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 