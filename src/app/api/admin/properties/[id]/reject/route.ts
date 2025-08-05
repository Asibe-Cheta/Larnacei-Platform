import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const { notes } = body;

    // Find the property
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.moderationStatus === 'REJECTED') {
      return NextResponse.json({ error: 'Property already rejected' }, { status: 400 });
    }

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        moderationStatus: 'REJECTED',
        isActive: false,
        rejectedAt: new Date(),
        rejectedBy: user.id,
        moderationNotes: notes
      }
    });

    // Create rejection notification
    if (property.owner) {
      await prisma.notification.create({
        data: {
          userId: property.owner.id,
          type: 'PROPERTY_REJECTED',
          title: 'Property Rejected',
          message: `Your property "${property.title}" has been rejected. Reason: ${notes || 'No reason provided'}`,
          data: {
            propertyId: property.id,
            propertyTitle: property.title,
            reason: notes
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Property rejected successfully',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Error rejecting property:', error);
    return NextResponse.json(
      { error: 'Failed to reject property' },
      { status: 500 }
    );
  }
} 