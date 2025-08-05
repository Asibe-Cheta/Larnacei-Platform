import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Test dashboard API: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Test dashboard API: Session:', session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Test the actual dashboard stats query
    const totalProperties = await prisma.property.count();
    const pendingApprovals = await prisma.property.count({
      where: { moderationStatus: 'PENDING' }
    });
    const totalUsers = await prisma.user.count();
    const recentProperties = await prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { name: true, email: true }
        }
      }
    });

    const stats = {
      totalProperties,
      pendingApprovals,
      totalUsers,
      totalRevenue: 0, // Placeholder
      recentProperties: recentProperties.map(p => ({
        id: p.id,
        title: p.title,
        moderationStatus: p.moderationStatus,
        owner: p.owner,
        createdAt: p.createdAt
      })),
      recentUsers: [] // Placeholder
    };

    console.log('Test dashboard API: Success - Stats:', stats);

    return NextResponse.json({
      success: true,
      message: 'Dashboard test endpoint working',
      stats
    });

  } catch (error) {
    console.error('Test dashboard API: Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 