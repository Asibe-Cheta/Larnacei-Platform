import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get featured properties (approved properties that are active)
    const properties = await prisma.property.findMany({
      where: {
        isActive: true,
        moderationStatus: 'APPROVED',
        // Include properties that are featured, admin-created, or approved
        OR: [
          { isFeatured: true },
          {
            owner: {
              role: 'ADMIN'
            }
          },
          { moderationStatus: 'APPROVED' }
        ]
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
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true,
          },
          orderBy: { isPrimary: 'desc' }
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
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 4, // Limit to 4 featured properties as requested
    });

    return NextResponse.json({
      properties,
      total: properties.length,
    });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 