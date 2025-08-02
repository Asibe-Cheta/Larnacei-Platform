import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Prisma import...');

    // Try to import Prisma
    const { PrismaClient } = await import('@prisma/client');
    console.log('PrismaClient imported successfully');

    // Try to create a client
    const prisma = new PrismaClient();
    console.log('PrismaClient created successfully');

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query executed successfully:', result);

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Prisma is working correctly'
    });

  } catch (error) {
    console.error('Prisma test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 