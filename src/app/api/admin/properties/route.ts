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
  purpose: z.enum(['SALE', 'RENT']).optional().default('SALE'),
  bedrooms: z.number().min(0, 'Bedrooms must be 0 or more').optional(),
  bathrooms: z.number().min(0, 'Bathrooms must be 0 or more').optional(),
  sizeInSqm: z.number().min(0, 'Size must be 0 or more').optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  location: z.string().min(1, 'Location is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  lga: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    console.log('Admin properties GET: Starting request');
    const startTime = Date.now();

    const session = await getServerSession(authOptions);
    console.log('Admin properties GET: Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Admin properties GET: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

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
    const moderationStatus = searchParams.get('moderationStatus');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('Admin properties GET: Query params:', { search, type, moderationStatus, isActive, page, limit });

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

    if (moderationStatus && moderationStatus !== 'all') {
      where.moderationStatus = moderationStatus.toUpperCase();
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    console.log('Admin properties GET: Where clause:', where);
    console.log('Admin properties GET: About to query database...');

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
        images: true,
        videos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.property.count({ where });

    console.log('Admin properties GET: Found properties:', properties.length);
    console.log('Admin properties GET: Total count:', total);

    return NextResponse.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin properties GET: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Admin properties POST: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Admin properties POST: Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Admin properties POST: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      console.log('Admin properties POST: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Admin properties POST: User not admin:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Admin properties POST: Request body:', body);

    const validatedData = adminPropertyCreateSchema.parse(body);
    console.log('Admin properties POST: Validated data:', validatedData);

    // Create property with auto-approval (without separate location table)
    const property = await prisma.property.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        type: validatedData.type,
        category: validatedData.category,
        purpose: validatedData.purpose || 'SALE',
        bedrooms: validatedData.bedrooms || 0,
        bathrooms: validatedData.bathrooms || 0,
        sizeInSqm: validatedData.sizeInSqm || 0,
        features: validatedData.features || [],
        amenities: validatedData.amenities || [],
        ownerId: user.id,
        city: validatedData.city,
        state: validatedData.state,
        location: validatedData.location,
        streetAddress: validatedData.streetAddress,
        lga: validatedData.lga || '',
        landmark: validatedData.landmark || '',
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        moderationStatus: 'APPROVED', // Auto-approve admin-created properties
        isActive: true,
        isFeatured: validatedData.isFeatured,
        isVerified: true, // Auto-verify admin-created properties
      },
    });

    console.log('Admin properties POST: Created property:', property.id);

    // Add images if provided
    if (validatedData.images && validatedData.images.length > 0) {
      const imageData = validatedData.images.map((url: string, index: number) => ({
        propertyId: property.id,
        url,
        alt: `Property image ${index + 1}`,
        order: index,
        isPrimary: index === 0,
      }));

      await prisma.propertyImage.createMany({
        data: imageData,
      });

      console.log('Admin properties POST: Added images:', validatedData.images.length);
    } else {
      // Add placeholder image if no images provided
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: 'https://res.cloudinary.com/dlzjymszg/image/upload/v1/larnacei-properties/placeholder',
          alt: 'Property placeholder image',
          order: 0,
          isPrimary: true,
        },
      });

      console.log('Admin properties POST: Added placeholder image');
    }

    // Add videos if provided
    if (validatedData.videos && validatedData.videos.length > 0) {
      const videoData = validatedData.videos.map((url: string, index: number) => ({
        propertyId: property.id,
        url,
        title: `Property video ${index + 1}`,
        type: 'WALKTHROUGH' as const,
      }));

      await prisma.propertyVideo.createMany({
        data: videoData,
      });

      console.log('Admin properties POST: Added videos:', validatedData.videos.length);
    }

    console.log('Admin properties POST: Property created successfully');

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      data: { property },
    });

  } catch (error) {
    console.error('Admin properties POST: Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 