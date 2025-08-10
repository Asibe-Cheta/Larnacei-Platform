import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Simple Admin users: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Simple Admin users: Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Simple Admin users: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    console.log('Simple Admin users: User found:', user);

    if (!user) {
      console.log('Simple Admin users: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Simple Admin users: User not admin:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('Simple Admin users: About to query users...');

    // Simple query without complex relations first
    const users = await prisma.user.findMany({
      where: {
        role: { notIn: ['ADMIN', 'SUPER_ADMIN'] }
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        accountType: true,
        verificationLevel: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
        image: true
      }
    });

    console.log('Simple Admin users: Users found:', users.length);

    const mappedUsers = users.map(u => ({
      ...u,
      propertiesCount: 0, // Simplified for now
      totalRevenue: 0, // Simplified for now
      verificationStatus: u.isVerified ? 'verified' : 
                         u.verificationLevel === 'EMAIL_VERIFIED' ? 'pending' : 'unverified',
      registrationDate: u.createdAt,
      lastActive: u.updatedAt,
      isSuspended: !u.isVerified,
      avatar: u.image
    }));

    console.log('Simple Admin users: Mapped users:', mappedUsers.length);

    return NextResponse.json({
      success: true,
      users: mappedUsers,
      total: users.length,
      page: 1,
      limit: 10
    });

  } catch (error) {
    console.error('Simple Admin users: Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
