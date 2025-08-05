import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for admin property creation
const adminPropertyCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  type: z.enum(['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL']),
  category: z.enum(['SHORT_STAY', 'LONG_TERM_RENTAL', 'LANDED_PROPERTY', 'PROPERTY_SALE']),
  bedrooms: z.number().min(0, 'Bedrooms must be 0 or more'),
  bathrooms: z.number().min(0, 'Bathrooms must be 0 or more'),
  size: z.number().min(0, 'Size must be 0 or more'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    console.log('Admin properties GET: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Admin properties GET: Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Admin properties GET: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    console.log('Admin properties GET: User found:', { id: user?.id, role: user?.role, email: user?.email });

    if (!user) {
      console.log('Admin properties GET: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Admin properties GET: User not admin:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('Admin properties GET: Query params:', { search, type, page, limit });

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { owner: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    console.log('Admin properties GET: Where clause:', where);

    // Get properties with owner details
    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: true,
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.property.count({ where });

    console.log('Admin properties GET: Found properties:', properties.length, 'Total:', total);

    return NextResponse.json({
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching admin properties:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Convert string numbers to actual numbers
    const processedBody = {
      ...body,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      bedrooms: typeof body.bedrooms === 'string' ? parseInt(body.bedrooms) : body.bedrooms,
      bathrooms: typeof body.bathrooms === 'string' ? parseInt(body.bathrooms) : body.bathrooms,
      size: typeof body.size === 'string' ? parseFloat(body.size) : body.size,
      latitude: body.latitude ? (typeof body.latitude === 'string' ? parseFloat(body.latitude) : body.latitude) : undefined,
      longitude: body.longitude ? (typeof body.longitude === 'string' ? parseFloat(body.longitude) : body.longitude) : undefined,
    };

    console.log('Admin property creation: Processing body:', processedBody);

    const validatedData = adminPropertyCreateSchema.parse(processedBody);

    // Create location first
    const location = await prisma.location.create({
      data: {
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        postalCode: validatedData.postalCode,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
      },
    });

    // Create property
    const property = await prisma.property.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        type: validatedData.type,
        category: validatedData.category,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        size: validatedData.size,
        features: validatedData.features || [],
        amenities: validatedData.amenities || [],
        moderationStatus: 'APPROVED', // Admin-created properties are automatically approved
        isActive: true,
        isVerified: true,
        ownerId: user.id, // Set admin as the owner
        locationId: location.id,
      },
    });

    // Add default placeholder image if no images provided
    if (!validatedData.images || validatedData.images.length === 0) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: 'https://via.placeholder.com/400x300?text=Property+Image',
          alt: 'Property placeholder image',
          isPrimary: true,
        },
      });
    } else {
      // Add provided images
      for (let i = 0; i < validatedData.images.length; i++) {
        await prisma.propertyImage.create({
          data: {
            propertyId: property.id,
            url: validatedData.images[i],
            alt: `Property image ${i + 1}`,
            isPrimary: i === 0, // First image is primary
          },
        });
      }
    }

    // Add videos if provided
    if (validatedData.videos && validatedData.videos.length > 0) {
      for (let i = 0; i < validatedData.videos.length; i++) {
        await prisma.propertyVideo.create({
          data: {
            propertyId: property.id,
            url: validatedData.videos[i],
            alt: `Property video ${i + 1}`,
          },
        });
      }
    }

    console.log('Admin property creation: Successfully created property:', property.id);

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      property: {
        id: property.id,
        title: property.title,
        price: property.price,
        type: property.type,
        moderationStatus: property.moderationStatus,
      },
    });
  } catch (error) {
    console.error('Error creating admin property:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
} 