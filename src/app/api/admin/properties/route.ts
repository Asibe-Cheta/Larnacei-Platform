import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

// Schema for admin property creation
const adminPropertyCreateSchema = z.object({
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
  isFeatured: z.boolean().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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

    // Check if user has admin privileges
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Admin properties GET: User not admin:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log('Admin properties GET: Query params:', { search, type, page, limit });

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    // Get properties with owner information
    const properties = await prisma.property.findMany({
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
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true,
          },
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count
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
      { error: 'Internal server error' },
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

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = adminPropertyCreateSchema.parse(body);

    // Create the property with admin as owner and automatically approved
    const property = await prisma.property.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || '',
        price: validatedData.price,
        currency: validatedData.currency,
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
        state: validatedData.state || '',
        city: validatedData.city || '',
        lga: validatedData.lga || '',
        streetAddress: validatedData.address || '',
        isActive: validatedData.isActive ?? true,
        isFeatured: validatedData.isFeatured ?? false,
        contactPhone: validatedData.contactPhone,
        contactEmail: validatedData.contactEmail,
        additionalNotes: validatedData.additionalNotes,
        // Admin-created properties are automatically approved
        moderationStatus: 'APPROVED',
        isVerified: true,
        // Set admin as the owner
        ownerId: user.id,
      },
    });

    // Add a default placeholder image
    await prisma.propertyImage.create({
      data: {
        propertyId: property.id,
        url: 'https://via.placeholder.com/400x300?text=Property+Image',
        alt: 'Property Image',
        isPrimary: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    console.error('Error creating admin property:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to create property',
    }, { status: 500 });
  }
} 