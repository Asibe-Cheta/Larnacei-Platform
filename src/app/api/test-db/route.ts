import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Test a simple query
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json(
      { 
        message: 'Database connection successful',
        userCount,
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 