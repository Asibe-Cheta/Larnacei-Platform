import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { subDays, startOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions, req, {} as any);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Platform-wide stats
  const [
    totalUsers,
    pendingProperties,
    activeListings,
    totalRevenue,
    newUsers,
    unresolvedReports,
    pendingKYC,
    adminProperties
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { moderationStatus: 'PENDING' } }),
    prisma.property.count({ where: { isActive: true, moderationStatus: 'APPROVED' } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS', createdAt: { gte: startOfMonth(new Date()) } } }),
    prisma.user.count({ where: { createdAt: { gte: subDays(new Date(), 7) } } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.user.count({ where: { kycStatus: { in: ['PENDING', 'IN_REVIEW'] } } }),
    prisma.property.count({ where: { createdBy: { role: 'admin' } } }),
  ]);

  return NextResponse.json({
    totalUsers,
    pendingProperties,
    activeListings,
    totalRevenue: totalRevenue._sum.amount || 0,
    newUsers,
    unresolvedReports,
    pendingKYC,
    adminProperties,
  });
} 