import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date ranges
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const timeRangeDate = new Date();
    
    switch (timeRange) {
      case '7d':
        timeRangeDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        timeRangeDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        timeRangeDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        timeRangeDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        timeRangeDate.setDate(now.getDate() - 30);
    }

    // Get all analytics data in parallel
    const [
      totalUsers,
      newUsersThisMonth,
      lastMonthUsers,
      usersByType,
      usersByLocation,
      totalProperties,
      activeProperties,
      pendingProperties,
      propertiesByCategory,
      propertiesByLocation,
      totalBookings,
      bookingsThisMonth,
      lastMonthBookings,
      totalRevenue,
      revenueThisMonth,
      lastMonthRevenue,
      revenueByCategory,
      revenueByLocation,
      performanceMetrics
    ] = await Promise.all([
      // Users analytics
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.user.count({ 
        where: { 
          role: { not: 'ADMIN' },
          createdAt: { gte: currentMonth }
        }
      }),
      prisma.user.count({ 
        where: { 
          role: { not: 'ADMIN' },
          createdAt: { gte: lastMonth, lt: currentMonth }
        }
      }),
      prisma.user.groupBy({
        by: ['accountType'],
        where: { role: { not: 'ADMIN' } },
        _count: { id: true }
      }),
      prisma.user.groupBy({
        by: ['location'],
        where: { role: { not: 'ADMIN' } },
        _count: { id: true }
      }),

      // Properties analytics
      prisma.property.count(),
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.property.groupBy({
        by: ['category'],
        _count: { id: true }
      }),
      prisma.property.groupBy({
        by: ['location'],
        _count: { id: true }
      }),

      // Bookings analytics
      prisma.booking.count(),
      prisma.booking.count({ 
        where: { createdAt: { gte: currentMonth } }
      }),
      prisma.booking.count({ 
        where: { createdAt: { gte: lastMonth, lt: currentMonth } }
      }),

      // Revenue analytics (from payments)
      prisma.payment.aggregate({
        where: { status: 'SUCCESSFUL' },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'SUCCESSFUL',
          createdAt: { gte: currentMonth }
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'SUCCESSFUL',
          createdAt: { gte: lastMonth, lt: currentMonth }
        },
        _sum: { amount: true }
      }),

      // Revenue by category (from bookings)
      prisma.booking.groupBy({
        by: ['property'],
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
        include: {
          property: {
            select: { category: true }
          }
        }
      }),

      // Revenue by location (from bookings)
      prisma.booking.groupBy({
        by: ['property'],
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
        include: {
          property: {
            select: { location: true }
          }
        }
      }),

      // Performance metrics (simplified - in real app, you'd use analytics service)
      Promise.resolve({
        pageViews: Math.floor(Math.random() * 50000) + 20000,
        uniqueVisitors: Math.floor(Math.random() * 15000) + 8000,
        averageSessionDuration: Math.random() * 5 + 2,
        bounceRate: Math.random() * 30 + 20
      })
    ]);

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0 ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100 : 0;
    const bookingGrowth = lastMonthBookings > 0 ? ((bookingsThisMonth - lastMonthBookings) / lastMonthBookings) * 100 : 0;
    const revenueGrowth = (lastMonthRevenue._sum.amount || 0) > 0 
      ? (((revenueThisMonth._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 0)) * 100 
      : 0;

    // Transform user type data
    const transformedUsersByType = usersByType.map(item => ({
      type: item.accountType === 'INDIVIDUAL' ? 'Individual' : 
            item.accountType === 'AGENT' ? 'Agent' : 'Agency',
      count: item._count.id,
      percentage: (item._count.id / totalUsers) * 100
    }));

    // Transform user location data
    const transformedUsersByLocation = usersByLocation
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 4)
      .map(item => ({
        location: item.location || 'Unknown',
        count: item._count.id,
        percentage: (item._count.id / totalUsers) * 100
      }));

    // Transform property category data
    const transformedPropertiesByCategory = propertiesByCategory.map(item => ({
      category: item.category === 'SHORT_STAY' ? 'Short Stay' :
                item.category === 'LONG_TERM_RENTAL' ? 'Long Term Rental' :
                item.category === 'PROPERTY_SALE' ? 'Property Sale' :
                item.category === 'LANDED_PROPERTY' ? 'Landed Property' : item.category,
      count: item._count.id,
      percentage: (item._count.id / totalProperties) * 100
    }));

    // Transform property location data
    const transformedPropertiesByLocation = propertiesByLocation
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 4)
      .map(item => ({
        location: item.location || 'Unknown',
        count: item._count.id,
        percentage: (item._count.id / totalProperties) * 100
      }));

    // Transform revenue by category
    const revenueByCategoryMap = new Map();
    revenueByCategory.forEach(item => {
      const category = item.property?.category || 'Unknown';
      const categoryName = category === 'SHORT_STAY' ? 'Short Stay' :
                          category === 'LONG_TERM_RENTAL' ? 'Long Term Rental' :
                          category === 'PROPERTY_SALE' ? 'Property Sale' :
                          category === 'LANDED_PROPERTY' ? 'Landed Property' : category;
      
      const currentAmount = revenueByCategoryMap.get(categoryName) || 0;
      revenueByCategoryMap.set(categoryName, currentAmount + (item._sum.totalAmount || 0));
    });

    const transformedRevenueByCategory = Array.from(revenueByCategoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: amount as number,
        percentage: ((amount as number) / (totalRevenue._sum.amount || 1)) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    // Transform revenue by location
    const revenueByLocationMap = new Map();
    revenueByLocation.forEach(item => {
      const location = item.property?.location || 'Unknown';
      const currentAmount = revenueByLocationMap.get(location) || 0;
      revenueByLocationMap.set(location, currentAmount + (item._sum.totalAmount || 0));
    });

    const transformedRevenueByLocation = Array.from(revenueByLocationMap.entries())
      .map(([location, amount]) => ({
        location,
        amount: amount as number,
        percentage: ((amount as number) / (totalRevenue._sum.amount || 1)) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate conversion rate and average booking value
    const conversionRate = totalUsers > 0 ? (totalBookings / totalUsers) * 100 : 0;
    const averageBookingValue = totalBookings > 0 ? (totalRevenue._sum.amount || 0) / totalBookings : 0;

    const analyticsData = {
      revenue: {
        total: totalRevenue._sum.amount || 0,
        monthly: revenueThisMonth._sum.amount || 0,
        growth: revenueGrowth,
        byCategory: transformedRevenueByCategory,
        byLocation: transformedRevenueByLocation
      },
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        growth: userGrowth,
        byType: transformedUsersByType,
        byLocation: transformedUsersByLocation
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
        pending: pendingProperties,
        byCategory: transformedPropertiesByCategory,
        byLocation: transformedPropertiesByLocation
      },
      bookings: {
        total: totalBookings,
        thisMonth: bookingsThisMonth,
        growth: bookingGrowth,
        conversionRate,
        averageValue: averageBookingValue
      },
      performance: performanceMetrics
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 