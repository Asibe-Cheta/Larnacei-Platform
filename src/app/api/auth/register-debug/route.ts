import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('🔍 Debug Registration API called');

  try {
    // Test database connection first
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body received:', { ...body, password: '[HIDDEN]' });
    } catch (jsonError) {
      console.error("❌ JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email.toLowerCase() },
          { phone: body.phone }
        ]
      }
    });

    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 409 }
      );
    }

    console.log('✅ No existing user found, proceeding with registration...');
    
    // For debug purposes, just return success without creating user
    console.log('✅ Debug registration successful');
    
    await prisma.$disconnect();
    
    return NextResponse.json(
      {
        message: 'Debug registration successful - database connection working',
        receivedData: { ...body, password: '[HIDDEN]' }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Debug registration error:', error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    return NextResponse.json(
      { 
        error: 'Debug registration failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 