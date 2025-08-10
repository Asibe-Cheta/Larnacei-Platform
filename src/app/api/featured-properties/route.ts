import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

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
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

    console.log('Featured properties GET: Found', featuredProperties.length, 'featured properties');

    // Serialize BigInt values for JSON response
    const serializedProperties = serializeBigInt(featuredProperties);

    return NextResponse.json({
      success: true,
      data: serializedProperties,
    });

  } catch (error: any) {
    console.error('Featured properties GET: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
