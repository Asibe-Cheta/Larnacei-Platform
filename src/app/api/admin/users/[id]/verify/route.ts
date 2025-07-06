import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/users/[id]/verify - Verify user KYC
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
      verificationStatus, 
      kycStatus, 
      notes, 
      documentType, 
      documentNumber,
      rejectionReason 
    } = body;

    // Validate required fields
    if (!verificationStatus || !kycStatus) {
      return NextResponse.json({ error: 'Verification status and KYC status are required' }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        kycDocuments: {
          select: {
            id: true,
            documentType: true,
            documentNumber: true,
            status: true,
            uploadedAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user verification status
    const updateData: any = {
      verificationStatus,
      kycStatus,
      verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
      verifiedBy: verificationStatus === 'VERIFIED' ? session.user.id : null,
      adminNotes: notes
    };

    // If rejecting, add rejection details
    if (verificationStatus === 'REJECTED') {
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = session.user.id;
      updateData.rejectionReason = rejectionReason;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Update KYC document status if provided
    if (documentType && documentNumber) {
      await prisma.kycDocument.updateMany({
        where: {
          userId: id,
          documentType,
          documentNumber
        },
        data: {
          status: verificationStatus === 'VERIFIED' ? 'APPROVED' : 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          adminNotes: notes
        }
      });
    }

    // Create verification notification
    const notificationType = verificationStatus === 'VERIFIED' ? 'KYC_APPROVED' : 'KYC_REJECTED';
    const notificationTitle = verificationStatus === 'VERIFIED' ? 'KYC Verification Approved' : 'KYC Verification Rejected';
    const notificationMessage = verificationStatus === 'VERIFIED' 
      ? 'Your KYC verification has been approved. You can now access all platform features.'
      : `Your KYC verification has been rejected. Reason: ${rejectionReason || 'Please contact support for details.'}`;

    await prisma.notification.create({
      data: {
        userId: id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        data: {
          verificationStatus,
          kycStatus,
          notes,
          rejectionReason
        }
      }
    });

    // Create admin audit log
    await prisma.adminAuditLog.create({
      data: {
        action: 'VERIFY_USER_KYC',
        adminId: session.user.id,
        targetType: 'USER',
        targetId: id,
        details: {
          previousVerificationStatus: user.verificationStatus,
          newVerificationStatus: verificationStatus,
          previousKycStatus: user.kycStatus,
          newKycStatus: kycStatus,
          notes,
          documentType,
          documentNumber,
          rejectionReason
        }
      }
    });

    // Send email notification
    // In a real app, you'd integrate with your email service
    console.log(`Sending KYC ${verificationStatus.toLowerCase()} email to ${user.email}`);

    return NextResponse.json({
      message: `User KYC ${verificationStatus.toLowerCase()} successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        verificationStatus: updatedUser.verificationStatus,
        kycStatus: updatedUser.kycStatus,
        verifiedAt: updatedUser.verifiedAt
      }
    });

  } catch (error) {
    console.error('User KYC verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id]/verify - Get user KYC details
export async function GET(
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

    // Get user with KYC details
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        kycDocuments: {
          select: {
            id: true,
            documentType: true,
            documentNumber: true,
            documentUrl: true,
            status: true,
            uploadedAt: true,
            reviewedAt: true,
            adminNotes: true
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        },
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        },
        bookings: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user,
      kycSummary: {
        totalDocuments: user.kycDocuments.length,
        approvedDocuments: user.kycDocuments.filter(doc => doc.status === 'APPROVED').length,
        pendingDocuments: user.kycDocuments.filter(doc => doc.status === 'PENDING').length,
        rejectedDocuments: user.kycDocuments.filter(doc => doc.status === 'REJECTED').length
      }
    });

  } catch (error) {
    console.error('Get user KYC details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 