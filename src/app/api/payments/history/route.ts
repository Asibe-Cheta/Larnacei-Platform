import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentType = searchParams.get('paymentType');
    const currency = searchParams.get('currency');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId: user.id };
    
    if (status) {
      where.status = status;
    }
    
    if (paymentType) {
      where.paymentType = paymentType;
    }
    
    if (currency) {
      where.currency = currency;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              property: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 }
                }
              }
            }
          },
          premiumFeature: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ]);

    // Calculate summary statistics
    const summary = await prisma.payment.aggregate({
      where: { userId: user.id },
      _sum: {
        amount: true,
        refundAmount: true
      },
      _count: {
        id: true
      }
    });

    // Calculate monthly earnings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await prisma.payment.groupBy({
      by: ['currency'],
      where: {
        userId: user.id,
        status: 'PAID',
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paymentType: payment.paymentType,
        status: payment.status,
        paystackReference: payment.paystackReference,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        refundAmount: payment.refundAmount,
        refundedAt: payment.refundedAt,
        booking: payment.booking ? {
          id: payment.booking.id,
          checkIn: payment.booking.checkIn,
          checkOut: payment.booking.checkOut,
          totalNights: payment.booking.totalNights,
          property: {
            id: payment.booking.property.id,
            title: payment.booking.property.title,
            location: payment.booking.property.location,
            image: payment.booking.property.images[0]?.url
          }
        } : null,
        premiumFeature: payment.premiumFeature ? {
          id: payment.premiumFeature.id,
          name: payment.premiumFeature.name,
          featureType: payment.premiumFeature.featureType
        } : null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalPayments: summary._count.id || 0,
        totalAmount: summary._sum.amount || 0,
        totalRefunds: summary._sum.refundAmount || 0,
        netAmount: (summary._sum.amount || 0) - (summary._sum.refundAmount || 0)
      },
      monthlyEarnings: monthlyEarnings.map(earning => ({
        currency: earning.currency,
        total: earning._sum.amount || 0
      }))
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payment history' 
    }, { status: 500 });
  }
} 