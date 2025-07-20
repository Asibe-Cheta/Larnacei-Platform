import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

interface DashboardStats {
  pendingProperties: number;
  newUsers: number;
  totalRevenue: number;
  activeListings: number;
  unresolvedReports: number;
  pendingKYC: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending properties count
    const pendingProperties = await prisma.property.count({
      where: { status: 'PENDING' }
    });

    // Get new users count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Get total revenue (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESSFUL',
        createdAt: {
          gte: startOfMonth
        }
      },
      select: {
        amount: true
      }
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get active listings count
    const activeListings = await prisma.property.count({
      where: { status: 'ACTIVE' }
    });

    // Get unresolved reports count
    const unresolvedReports = await prisma.report.count({
      where: { status: 'PENDING' }
    });

    // Get pending KYC count
    const pendingKYC = await prisma.user.count({
      where: {
        kycStatus: 'PENDING'
      }
    });

    const stats: DashboardStats = {
      pendingProperties,
      newUsers,
      totalRevenue,
      activeListings,
      unresolvedReports,
      pendingKYC
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 