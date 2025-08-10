import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';
import { z } from 'zod';

// Schema for property updates
const propertyUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('NGN'),
  propertyType: z.string().optional(),
  category: z.string().optional(),
  purpose: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  parkingSpaces: z.number().optional(),
  landSize: z.number().optional(),
  builtUpArea: z.number().optional(),
  yearBuilt: z.number().optional(),
  condition: z.string().optional(),
  furnishingStatus: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  lga: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  additionalNotes: z.string().optional(),
});

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
    console.log('Property detail GET: Starting request for ID:', id);

    if (!id) {
      console.log('Property detail GET: No ID provided');
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    // Fetch property with all related data
    console.log('Property detail GET: Querying database for property with ID:', id);
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
      console.log('Property detail GET: Property not found in database for ID:', id);
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    console.log('Property detail GET: Property found:', property.id, property.title);

    // Check if user is admin
    const session = await getServerSession(authOptions);
    let isAdmin = false;
    
    console.log('Property detail GET: Checking admin status for user:', session?.user?.email);
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
      console.log('Property detail GET: User role:', user?.role, 'isAdmin:', isAdmin);
    }

    // Only return active and approved properties (unless admin)
    console.log('Property detail GET: Property status check:', {
      isAdmin,
      isActive: property.isActive,
      moderationStatus: property.moderationStatus
    });
    
    if (!isAdmin && (!property.isActive || property.moderationStatus !== "APPROVED")) {
      console.log('Property detail GET: Property not available - not active or not approved');
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

    // Serialize BigInt values for JSON response
    const serializedResponse = serializeBigInt({
      success: true,
      message: "Property details fetched successfully",
      data: property,
    });

    return NextResponse.json(serializedResponse, { status: 200 });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if property exists and belongs to the user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: params.id,
        ownerId: user.id,
      },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = propertyUpdateSchema.parse(body);

    // Update the property
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        currency: validatedData.currency as any,
        type: validatedData.propertyType as any,
        category: validatedData.category as any,
        purpose: validatedData.purpose as any,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        parkingSpaces: validatedData.parkingSpaces,
        landSize: validatedData.landSize,
        builtUpArea: validatedData.builtUpArea,
        yearBuilt: validatedData.yearBuilt,
        condition: validatedData.condition as any,
        furnishingStatus: validatedData.furnishingStatus as any,
        state: validatedData.state,
        city: validatedData.city,
        lga: validatedData.lga,
        isActive: validatedData.isActive,
        contactPhone: validatedData.contactPhone,
        contactEmail: validatedData.contactEmail,
        additionalNotes: validatedData.additionalNotes,
        // Reset moderation status when property is updated
        moderationStatus: 'PENDING',
      },
    });

    // Serialize BigInt values for JSON response
    const serializedResponse = serializeBigInt({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty,
    });

    return NextResponse.json(serializedResponse);
  } catch (error) {
    console.error('Error updating property:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to update property',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if property exists and belongs to the user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: params.id,
        ownerId: user.id,
      },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Delete the property and all related data
    await prisma.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({
      error: 'Failed to delete property',
    }, { status: 500 });
  }
} 