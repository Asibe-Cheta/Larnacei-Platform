import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { notes } = body;

    // Update property status
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        moderationStatus: 'APPROVED',
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Create notification for property owner
    if (property.owner) {
      await prisma.notification.create({
        data: {
          userId: property.owner.id,
          type: 'PROPERTY_APPROVED',
          title: 'Property Approved',
          message: `Your property "${property.title}" has been approved and is now live on the platform.`,
          data: {
            propertyId: property.id,
            propertyTitle: property.title,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Property approved successfully',
      data: property,
    });
  } catch (error) {
    console.error('Error approving property:', error);
    return NextResponse.json(
      { error: 'Failed to approve property' },
      { status: 500 }
    );
  }
} 