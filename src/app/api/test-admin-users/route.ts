import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Test Admin Users: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Test Admin Users: Session:', session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: 'User must be logged in to access admin features'
      }, { status: 401 });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found in database',
        debug: `Session email: ${session.user.email}`
      }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required',
        debug: `User role: ${user.role}, required: ADMIN or SUPER_ADMIN`
      }, { status: 403 });
    }

    // Try to get a simple count of users
    const userCount = await prisma.user.count({
      where: {
        role: { notIn: ['ADMIN', 'SUPER_ADMIN'] }
      }
    });

    // Try to get a few sample users
    const sampleUsers = await prisma.user.findMany({
      where: {
        role: { notIn: ['ADMIN', 'SUPER_ADMIN'] }
      },
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        verificationLevel: true,
        kycStatus: true,
        accountType: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      debug: {
        adminUser: user,
        totalUsers: userCount,
        sampleUsers: sampleUsers
      },
      message: 'Admin users API is working correctly'
    });

  } catch (error) {
    console.error('Test Admin Users: Error:', error);
    return NextResponse.json({
      error: 'Database or server error',
      debug: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
