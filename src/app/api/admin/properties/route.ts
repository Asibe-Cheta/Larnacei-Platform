import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

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
      where.propertyType = type;
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
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;
    const price = formData.get('price') as string;
    const currency = formData.get('currency') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const address = formData.get('address') as string;
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const sizeInSqm = formData.get('sizeInSqm') as string;
         const isFeatured = formData.get('isFeatured') === 'true';
     const isActive = formData.get('isActive') === 'true';
     const isApproved = formData.get('isApproved') === 'true';
     const isVerified = formData.get('isVerified') === 'true';
    const amenities = JSON.parse(formData.get('amenities') as string || '[]');
    const contactPhone = formData.get('contactPhone') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const contactName = formData.get('contactName') as string;
    
    // Get image files
    const imageFiles = formData.getAll('images') as File[];

    // Validate required fields
    if (!title || !description || !category || !type || !price || !city || !state || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or get admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@larnacei.com',
          name: 'Larnacei Admin',
          role: 'ADMIN',
          isVerified: true,
        },
      });
    }

         // Create property
     const property = await prisma.property.create({
       data: {
         title,
         description,
         category: category as any,
         type: type as any,
         price: parseFloat(price.replace(/,/g, '')),
         currency: currency as any,
         city,
         state,
         address,
         bedrooms: bedrooms ? parseInt(bedrooms) : null,
         bathrooms: bathrooms ? parseInt(bathrooms) : null,
         sizeInSqm: sizeInSqm ? parseInt(sizeInSqm) : null,
         isFeatured,
         isActive,
         isApproved,
         isVerified,
         features: amenities,
         contactPhone,
         contactEmail,
         contactName,
         ownerId: adminUser.id,
         viewCount: 0,
         inquiryCount: 0,
         favoriteCount: 0,
       },
     });

    // Handle image uploads
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file, index) => {
        try {
          // Create uploads directory if it doesn't exist
          const uploadsDir = join(process.cwd(), 'public', 'uploads');
          await mkdir(uploadsDir, { recursive: true });

          // Generate unique filename
          const timestamp = Date.now();
          const filename = `${property.id}-${index}-${timestamp}.${file.name.split('.').pop()}`;
          const filepath = join(uploadsDir, filename);

          // Convert File to Buffer and save
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);

          // Save image record to database
          return prisma.propertyImage.create({
            data: {
              propertyId: property.id,
              url: `/uploads/${filename}`,
              alt: `${property.title} - Image ${index + 1}`,
              isPrimary: index === 0, // First image is primary
            },
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          return null;
        }
      });

      await Promise.all(uploadPromises);
    }

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        title: property.title,
        message: 'Property created successfully',
      },
    });
  } catch (error) {
    console.error('Error creating admin property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 