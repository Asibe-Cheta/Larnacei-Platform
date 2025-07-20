import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

interface ModerationRequest {
  action: 'approve' | 'reject';
  propertyIds: string[];
  reason?: string;
}

interface ModerationResponse {
  success: boolean;
  message: string;
  processedCount?: number;
}

interface PropertyModerationData {
  id: string;
  title: string;
  status: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const priority = searchParams.get('priority') || '';

    const skip = (page - 1) * limit;

    // Build where clause for pending properties
    const where: {
      status: string;
      OR?: Array<{
        title?: { contains: string; mode: string };
        location?: { contains: string; mode: string };
        owner?: { name: { contains: string; mode: string } };
      }>;
      owner?: {
        verificationStatus?: string | { not: string };
      };
      priority?: string;
    } = {
      status: 'PENDING'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { owner: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (filter && filter !== 'all') {
      switch (filter) {
        case 'verified':
          where.owner = { ...where.owner, verificationStatus: 'VERIFIED' };
          break;
        case 'unverified':
          where.owner = { ...where.owner, verificationStatus: { not: 'VERIFIED' } };
          break;
        case 'high-priority':
          where.priority = 'HIGH';
          break;
      }
    }

    if (priority) {
      where.priority = priority.toUpperCase();
    }

    // Get pending properties with related data
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verificationStatus: true,
              kycStatus: true,
              createdAt: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              isPrimary: true
            },
            orderBy: { isPrimary: 'desc' }
          },
          legalDocuments: {
            select: {
              id: true,
              type: true,
              status: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ]);

    // Transform data for moderation interface
    const transformedProperties = properties.map(property => {
      const primaryImage = property.images.find(img => img.isPrimary)?.url ||
        property.images[0]?.url || '/images/placeholder.jpg';

      // Calculate priority based on various factors
      let priority = 'LOW';
      if (property.priority === 'HIGH') {
        priority = 'high';
      } else if (property.priority === 'MEDIUM') {
        priority = 'medium';
      } else {
        // Auto-calculate priority based on factors
        const factors = [];
        if (property.owner.verificationStatus === 'VERIFIED') factors.push(1);
        if (property.images.length >= 5) factors.push(1);
        if (property.legalDocuments.length > 0) factors.push(1);
        if (property.price > 10000000) factors.push(1); // High value property

        if (factors.length >= 3) priority = 'high';
        else if (factors.length >= 2) priority = 'medium';
        else priority = 'low';
      }

      return {
        id: property.id,
        title: property.title,
        location: property.location,
        price: property.price,
        currency: property.currency,
        category: property.category,
        owner: {
          name: property.owner.name,
          email: property.owner.email,
          phone: property.owner.phone,
          verificationStatus: property.owner.verificationStatus.toLowerCase(),
          kycStatus: property.owner.kycStatus.toLowerCase(),
          joinedAt: property.owner.createdAt.toISOString()
        },
        submittedAt: property.createdAt.toISOString(),
        priority,
        imageCount: property.images.length,
        hasLegalDocs: property.legalDocuments.length > 0,
        isVerified: property.owner.verificationStatus === 'VERIFIED',
        image: primaryImage,
        description: property.description,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        areaUnit: property.areaUnit,
        legalDocuments: property.legalDocuments,
        totalImages: property.images.length
      };
    });

    return NextResponse.json({
      properties: transformedProperties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Admin moderation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, propertyIds, reason } = body;

    if (!action || !propertyIds || !Array.isArray(propertyIds)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Perform bulk action
    const updateData: {
      status: string;
      reviewedAt: Date;
      reviewedBy: string;
      rejectionReason?: string;
    } = {
      status: action === 'approve' ? 'ACTIVE' : 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: session.user.email
    };

    if (action === 'reject' && reason) {
      updateData.rejectionReason = reason;
    }

    const updatedProperties = await prisma.property.updateMany({
      where: {
        id: { in: propertyIds },
        status: 'PENDING'
      },
      data: updateData
    });

    // Create audit logs
    await prisma.adminAuditLog.createMany({
      data: propertyIds.map(propertyId => ({
        action: action === 'approve' ? 'APPROVE_PROPERTY' : 'REJECT_PROPERTY',
        adminId: session.user.email,
        targetType: 'PROPERTY',
        targetId: propertyId,
        details: {
          action,
          reason: action === 'reject' ? reason : null,
          bulkAction: true
        }
      }))
    });

    return NextResponse.json({
      message: `${action === 'approve' ? 'Approved' : 'Rejected'} ${updatedProperties.count} properties`,
      updatedCount: updatedProperties.count
    });

  } catch (error) {
    console.error('Moderation action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 