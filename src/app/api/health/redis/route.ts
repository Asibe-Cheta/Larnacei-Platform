import { NextRequest, NextResponse } from 'next/server';
import { checkRedisHealth, cacheManager } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const isHealthy = await checkRedisHealth();
    
    if (!isHealthy) {
      return NextResponse.json(
        {
          success: false,
          message: 'Redis is not healthy',
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    // Get cache statistics
    const stats = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: {
        propertyListings: await cacheManager.getPropertyListings('stats'),
        searchResults: await cacheManager.getSearchResults('stats'),
        analytics: await cacheManager.getAnalytics('stats')
      }
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Redis is healthy',
        data: stats
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Redis health check error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Redis health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 