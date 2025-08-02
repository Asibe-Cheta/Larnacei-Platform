import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');

    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful:', result);

    // Test user count
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    return NextResponse.json({
      success: true,
      database: 'Connected',
      userCount,
      message: 'Database connection successful'
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      database: 'Failed'
    }, { status: 500 });
  }
} 