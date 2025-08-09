import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Featured properties GET: Starting request');

    // Get featured properties, limited to 4, ordered by most recent
    const featuredProperties = await prisma.property.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        moderationStatus: 'APPROVED',
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
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

    console.log('Featured properties GET: Found', featuredProperties.length, 'featured properties');

    return NextResponse.json({
      success: true,
      data: featuredProperties,
    });

  } catch (error) {
    console.error('Featured properties GET: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
