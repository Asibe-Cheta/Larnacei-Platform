import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Test images API: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Test images API: Session:', session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all properties with their images
    const properties = await prisma.property.findMany({
      include: {
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true,
            order: true
          },
          orderBy: { order: 'asc' }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get image statistics
    const totalImages = await prisma.propertyImage.count();
    const propertiesWithImages = properties.filter(p => p.images.length > 0);
    const propertiesWithoutImages = properties.filter(p => p.images.length === 0);

    console.log('Test images API: Success - Found properties:', properties.length);
    console.log('Test images API: Properties with images:', propertiesWithImages.length);
    console.log('Test images API: Properties without images:', propertiesWithoutImages.length);
    console.log('Test images API: Total images in database:', totalImages);

    return NextResponse.json({
      success: true,
      message: 'Images test endpoint working',
      stats: {
        totalProperties: properties.length,
        propertiesWithImages: propertiesWithImages.length,
        propertiesWithoutImages: propertiesWithoutImages.length,
        totalImages: totalImages
      },
      properties: properties.map(p => ({
        id: p.id,
        title: p.title,
        owner: p.owner,
        imageCount: p.images.length,
        images: p.images,
        moderationStatus: p.moderationStatus,
        createdAt: p.createdAt
      }))
    });

  } catch (error) {
    console.error('Test images API: Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 