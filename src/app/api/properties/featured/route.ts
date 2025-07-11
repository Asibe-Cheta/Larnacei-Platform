import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get featured properties (admin-created properties that are active and approved)
    const properties = await prisma.property.findMany({
      where: {
        isActive: true,
        isVerified: true,
        // Include properties that are featured or have specific admin types
        OR: [
          { isFeatured: true },
          { 
            owner: {
              role: 'ADMIN'
            }
          }
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
      take: 8, // Limit to 8 featured properties
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