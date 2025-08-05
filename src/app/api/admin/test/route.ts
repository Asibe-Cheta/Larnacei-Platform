import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin test endpoint called');

    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    console.log('User found:', user);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    console.log('Is admin:', isAdmin);

    // Test database connection
    const propertyCount = await prisma.property.count();
    console.log('Property count:', propertyCount);

    return NextResponse.json({
      success: true,
      session: session.user,
      user: user,
      isAdmin: isAdmin,
      propertyCount: propertyCount,
      message: 'Admin test endpoint working'
    });
  } catch (error) {
    console.error('Error in admin test:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 