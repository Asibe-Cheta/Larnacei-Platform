import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/properties/[id]/approve - Approve a property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.email?.includes('admin') || 
                   session.user.email === 'admin@larnacei.com';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { notes, featured = false, adminNotes } = body;

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

    if (property.status === 'APPROVED') {
      return NextResponse.json({ error: 'Property already approved' }, { status: 400 });
    }

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: session.user.id,
        featured,
        adminNotes,
        moderationNotes: notes
      }
    });

    // Create approval notification
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'PROPERTY_APPROVED',
        title: 'Property Approved',
        message: `Your property "${property.title}" has been approved and is now live on the platform.`,
        data: {
          propertyId: property.id,
          propertyTitle: property.title,
          adminNotes: notes
        }
      }
    });

    // Create admin audit log
    await prisma.adminAuditLog.create({
      data: {
        action: 'APPROVE_PROPERTY',
        adminId: session.user.id,
        targetType: 'PROPERTY',
        targetId: property.id,
        details: {
          previousStatus: property.status,
          newStatus: 'APPROVED',
          notes,
          featured,
          ownerId: property.ownerId
        }
      }
    });

    // Send email notification to property owner
    // In a real app, you'd integrate with your email service
    console.log(`Sending approval email to ${property.owner?.email}`);

    return NextResponse.json({
      message: 'Property approved successfully',
      property: {
        id: updatedProperty.id,
        title: updatedProperty.title,
        status: updatedProperty.status,
        approvedAt: updatedProperty.approvedAt
      }
    });

  } catch (error) {
    console.error('Property approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 