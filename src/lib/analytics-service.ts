import { prisma } from './prisma';
import { serializeBigInt } from './bigint-serializer';

export class AnalyticsService {
  async getPlatformAnalytics(timeRange: string = '30d') {
    try {
      console.log('Getting platform analytics for timeRange:', timeRange);
      
      // Calculate date range
      const now = new Date();
      const daysBack = this.parseDaysFromTimeRange(timeRange);
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      console.log('Date range:', { startDate, endDate: now });

      // Get user metrics
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: startDate
          }
        }
      });
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      });
      const verifiedUsers = await prisma.user.count({
        where: {
          isVerified: true
        }
      });

      // Get property metrics
      const totalProperties = await prisma.property.count();
      const activeProperties = await prisma.property.count({
        where: {
          isActive: true,
          moderationStatus: 'APPROVED'
        }
      });
      const newProperties = await prisma.property.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      });
      const featuredProperties = await prisma.property.count({
        where: {
          isFeatured: true,
          isActive: true
        }
      });

      // Get inquiry metrics
      const totalInquiries = await prisma.inquiry.count();
      const newInquiries = await prisma.inquiry.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      });
      const respondedInquiries = await prisma.inquiry.count({
        where: {
          status: 'RESPONDED'
        }
      });

      // Get payment metrics (convert BigInt to numbers)
      const totalPaymentsResult = await prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        _count: {
          id: true
        },
        where: {
          status: 'PAID'
        }
      });

      const recentPaymentsResult = await prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        _count: {
          id: true
        },
        where: {
          status: 'PAID',
          createdAt: {
            gte: startDate
          }
        }
      });

      // Convert BigInt to numbers safely
      const totalRevenue = totalPaymentsResult._sum.amount ? Number(totalPaymentsResult._sum.amount) / 100 : 0;
      const recentRevenue = recentPaymentsResult._sum.amount ? Number(recentPaymentsResult._sum.amount) / 100 : 0;

      // Get property category breakdown
      const propertyCategories = await prisma.property.groupBy({
        by: ['category'],
        _count: {
          id: true
        },
        where: {
          isActive: true,
          moderationStatus: 'APPROVED'
        }
      });

      // Get property type breakdown
      const propertyTypes = await prisma.property.groupBy({
        by: ['type'],
        _count: {
          id: true
        },
        where: {
          isActive: true,
          moderationStatus: 'APPROVED'
        }
      });

      // Get user growth over time (last 7 days)
      const userGrowth = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        const dayUsers = await prisma.user.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        userGrowth.push({
          date: startOfDay.toISOString().split('T')[0],
          users: dayUsers
        });
      }

      // Get property growth over time (last 7 days)
      const propertyGrowth = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        const dayProperties = await prisma.property.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        propertyGrowth.push({
          date: startOfDay.toISOString().split('T')[0],
          properties: dayProperties
        });
      }

      const analyticsData = {
        overview: {
          totalUsers,
          activeUsers,
          newUsers,
          verifiedUsers,
          totalProperties,
          activeProperties,
          newProperties,
          featuredProperties,
          totalInquiries,
          newInquiries,
          respondedInquiries,
          totalRevenue,
          recentRevenue,
          totalPayments: totalPaymentsResult._count.id,
          recentPayments: recentPaymentsResult._count.id
        },
        charts: {
          userGrowth,
          propertyGrowth,
          propertyCategories: propertyCategories.map(cat => ({
            category: cat.category,
            count: cat._count.id
          })),
          propertyTypes: propertyTypes.map(type => ({
            type: type.type,
            count: type._count.id
          }))
        },
        timeRange,
        generatedAt: now.toISOString()
      };

      console.log('Analytics data generated successfully');
      return serializeBigInt(analyticsData);

    } catch (error) {
      console.error('Error generating platform analytics:', error);
      throw error;
    }
  }

  async getMarketIntelligence() {
    try {
      console.log('Getting market intelligence data');

      // Get average prices by category
      const avgPricesByCategory = await prisma.property.groupBy({
        by: ['category'],
        _avg: {
          price: true
        },
        _count: {
          id: true
        },
        where: {
          isActive: true,
          moderationStatus: 'APPROVED'
        }
      });

      // Get average prices by location (state)
      const avgPricesByState = await prisma.property.groupBy({
        by: ['state'],
        _avg: {
          price: true
        },
        _count: {
          id: true
        },
        where: {
          isActive: true,
          moderationStatus: 'APPROVED'
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10 // Top 10 states
      });

      // Get price distribution
      const priceRanges = [
        { min: 0, max: 100000000, label: '₦0 - ₦1M' }, // 0 - 1M naira
        { min: 100000000, max: 500000000, label: '₦1M - ₦5M' }, // 1M - 5M naira
        { min: 500000000, max: 1000000000, label: '₦5M - ₦10M' }, // 5M - 10M naira
        { min: 1000000000, max: 5000000000, label: '₦10M - ₦50M' }, // 10M - 50M naira
        { min: 5000000000, max: null, label: '₦50M+' } // 50M+ naira
      ];

      const priceDistribution = [];
      for (const range of priceRanges) {
        const count = await prisma.property.count({
          where: {
            isActive: true,
            moderationStatus: 'APPROVED',
            price: {
              gte: BigInt(range.min),
              ...(range.max ? { lt: BigInt(range.max) } : {})
            }
          }
        });

        priceDistribution.push({
          range: range.label,
          count
        });
      }

      // Get most popular features/amenities
      const properties = await prisma.property.findMany({
        where: {
          isActive: true,
          moderationStatus: 'APPROVED'
        },
        select: {
          features: true
        }
      });

      const featureCount = new Map<string, number>();
      properties.forEach(property => {
        property.features.forEach(feature => {
          featureCount.set(feature, (featureCount.get(feature) || 0) + 1);
        });
      });

      const popularFeatures = Array.from(featureCount.entries())
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const marketData = {
        pricing: {
          averageByCategory: avgPricesByCategory.map(cat => ({
            category: cat.category,
            averagePrice: cat._avg.price ? Number(cat._avg.price) / 100 : 0, // Convert from kobo
            count: cat._count.id
          })),
          averageByState: avgPricesByState.map(state => ({
            state: state.state,
            averagePrice: state._avg.price ? Number(state._avg.price) / 100 : 0, // Convert from kobo
            count: state._count.id
          })),
          priceDistribution
        },
        features: {
          popularFeatures
        },
        generatedAt: new Date().toISOString()
      };

      console.log('Market intelligence data generated successfully');
      return serializeBigInt(marketData);

    } catch (error) {
      console.error('Error generating market intelligence:', error);
      throw error;
    }
  }

  private parseDaysFromTimeRange(timeRange: string): number {
    switch (timeRange) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '1y':
        return 365;
      default:
        return 30;
    }
  }
}

export const analyticsService = new AnalyticsService();