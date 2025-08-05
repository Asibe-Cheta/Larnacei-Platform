import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get dashboard statistics
    const [
      totalProperties,
      pendingApprovals,
      totalUsers,
      recentProperties,
      recentUsers
    ] = await Promise.all([
      // Total properties
      prisma.property.count(),

      // Pending approvals
      prisma.property.count({
        where: { moderationStatus: 'PENDING' }
      }),

      // Total users
      prisma.user.count(),

      // Recent properties (last 5)
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          city: true,
          state: true,
          moderationStatus: true,
          createdAt: true
        }
      }),

      // Recent users (last 5)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true
        }
      })
    ]);

    // Calculate total revenue (placeholder - implement actual revenue calculation)
    const totalRevenue = 0; // TODO: Implement actual revenue calculation

    return NextResponse.json({
      totalProperties,
      pendingApprovals,
      totalUsers,
      totalRevenue,
      recentProperties,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 