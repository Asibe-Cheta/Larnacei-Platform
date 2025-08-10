import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// POST /api/admin/users/[id]/verify - Verify user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = params;

    // Find the user to verify
    const userToVerify = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToVerify) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        verificationLevel: 'FULL_VERIFIED',
        kycStatus: 'COMPLETED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isVerified: updatedUser.isVerified,
        verificationLevel: updatedUser.verificationLevel,
        kycStatus: updatedUser.kycStatus
      }
    });

  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}