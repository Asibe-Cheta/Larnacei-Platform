import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin test properties endpoint called');

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

    // Test database connection and get all properties - FIXED: Removed invalid 'location' include
    const allProperties = await prisma.property.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 for testing
    });

    console.log('All properties found:', allProperties.length);

    // Get properties by moderation status
    const pendingProperties = await prisma.property.count({
      where: { moderationStatus: 'PENDING' }
    });

    const approvedProperties = await prisma.property.count({
      where: { moderationStatus: 'APPROVED' }
    });

    const rejectedProperties = await prisma.property.count({
      where: { moderationStatus: 'REJECTED' }
    });

    console.log('Property counts:', { pendingProperties, approvedProperties, rejectedProperties });

    return NextResponse.json({
      success: true,
      session: session.user,
      user: user,
      isAdmin: isAdmin,
      totalProperties: allProperties.length,
      propertyCounts: {
        pending: pendingProperties,
        approved: approvedProperties,
        rejected: rejectedProperties,
      },
      sampleProperties: allProperties.map(p => ({
        id: p.id,
        title: p.title,
        moderationStatus: p.moderationStatus,
        owner: p.owner,
        createdAt: p.createdAt,
      })),
      message: 'Admin test properties endpoint working'
    });
  } catch (error) {
    console.error('Error in admin test properties:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 