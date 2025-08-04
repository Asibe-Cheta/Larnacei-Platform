import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'No session found',
        session: null
      }, { status: 401 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'User not found in database',
        session: session.user,
        user: null
      }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    return NextResponse.json({
      session: session.user,
      user: user,
      isAdmin: isAdmin,
      canAccessAdmin: isAdmin,
      message: isAdmin ? 'User has admin access' : 'User does not have admin access'
    });
  } catch (error) {
    console.error('Error in debug-user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 