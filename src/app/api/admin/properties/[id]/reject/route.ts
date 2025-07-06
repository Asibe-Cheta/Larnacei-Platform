import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/properties/[id]/reject - Reject a property
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
    const { 
      reason, 
      detailedFeedback, 
      requiredChanges, 
      canResubmit = true,
      resubmissionDeadline 
    } = body;

    // Validate required fields
    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

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

    if (property.status === 'REJECTED') {
      return NextResponse.json({ error: 'Property already rejected' }, { status: 400 });
    }

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: session.user.id,
        rejectionReason: reason,
        rejectionDetails: {
          detailedFeedback,
          requiredChanges,
          canResubmit,
          resubmissionDeadline: resubmissionDeadline ? new Date(resubmissionDeadline) : null
        },
        moderationNotes: detailedFeedback
      }
    });

    // Create rejection notification
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'PROPERTY_REJECTED',
        title: 'Property Rejected',
        message: `Your property "${property.title}" has been rejected. Please review the feedback and make necessary changes.`,
        data: {
          propertyId: property.id,
          propertyTitle: property.title,
          reason,
          detailedFeedback,
          requiredChanges,
          canResubmit,
          resubmissionDeadline
        }
      }
    });

    // Create admin audit log
    await prisma.adminAuditLog.create({
      data: {
        action: 'REJECT_PROPERTY',
        adminId: session.user.id,
        targetType: 'PROPERTY',
        targetId: property.id,
        details: {
          previousStatus: property.status,
          newStatus: 'REJECTED',
          reason,
          detailedFeedback,
          requiredChanges,
          canResubmit,
          ownerId: property.ownerId
        }
      }
    });

    // Send email notification to property owner
    // In a real app, you'd integrate with your email service
    console.log(`Sending rejection email to ${property.owner?.email}`);

    return NextResponse.json({
      message: 'Property rejected successfully',
      property: {
        id: updatedProperty.id,
        title: updatedProperty.title,
        status: updatedProperty.status,
        rejectedAt: updatedProperty.rejectedAt,
        rejectionReason: updatedProperty.rejectionReason
      }
    });

  } catch (error) {
    console.error('Property rejection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 