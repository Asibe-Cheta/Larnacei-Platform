import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('User detail GET: Starting request for user ID:', params.id);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('User detail GET: No session found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
      console.log('User detail GET: User is not admin, role:', currentUser?.role);
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('User detail GET: Fetching user details for ID:', params.id);

    // Fetch user details with related data
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        _count: {
          select: {
            properties: true,
            inquiries: true,
            payments: true,
          }
        }
      }
    });

    if (!user) {
      console.log('User detail GET: User not found for ID:', params.id);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User detail GET: User found, returning details');

    // Serialize BigInt values and return user data
    const serializedUser = serializeBigInt({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isVerified: user.isVerified,
      verificationLevel: user.verificationLevel,
      isActive: user.isActive,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      _count: user._count
    });

    return NextResponse.json({
      success: true,
      user: serializedUser
    });

  } catch (error: any) {
    console.error('User detail GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
