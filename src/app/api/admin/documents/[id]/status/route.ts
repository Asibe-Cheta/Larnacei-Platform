import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { status, rejectionReason } = await req.json();

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (APPROVED, REJECTED, PENDING)' },
        { status: 400 }
      );
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a document' },
        { status: 400 }
      );
    }

    const updateData: any = {
      verificationStatus: status,
      verifiedAt: status === 'APPROVED' ? new Date() : null,
      verifiedBy: status === 'APPROVED' ? user.id : null,
    };

    if (status === 'REJECTED') {
      updateData.rejectionReason = rejectionReason;
    } else {
      updateData.rejectionReason = null;
    }

    const document = await prisma.verificationDocument.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // If approved, check if user should be upgraded to verified status
    if (status === 'APPROVED') {
      const userDocs = await prisma.verificationDocument.findMany({
        where: { 
          userId: document.userId,
          verificationStatus: 'APPROVED'
        }
      });

      // If user has at least one approved document, upgrade verification level
      let newVerificationLevel = 'PARTIAL';
      if (userDocs.length >= 2) {
        newVerificationLevel = 'VERIFIED';
      }

      await prisma.user.update({
        where: { id: document.userId },
        data: {
          verificationLevel: newVerificationLevel,
          isVerified: userDocs.length > 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      document: serializeBigInt(document),
      message: `Document ${status.toLowerCase()} successfully`
    });
  } catch (error: any) {
    console.error('Document status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
