import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('🧪 Test Registration API called');

  try {
    // Step 1: Check environment variables
    console.log('Step 1: Checking environment variables...');
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    console.log('DATABASE_URL configured:', hasDatabaseUrl);

    if (!hasDatabaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 503 }
      );
    }

    // Step 2: Test database connection
    console.log('Step 2: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Step 3: Parse request body
    console.log('Step 3: Parsing request body...');
    const body = await request.json();
    console.log('Request body received:', { ...body, password: '[HIDDEN]' });

    // Step 4: Test a simple database query
    console.log('Step 4: Testing database query...');
    const userCount = await prisma.user.count();
    console.log('✅ Database query successful, user count:', userCount);

    // Step 5: Test user creation (without actually creating)
    console.log('Step 5: Testing user creation logic...');
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email?.toLowerCase() },
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

    console.log('✅ No existing user found');

    // Step 6: Test password hashing
    console.log('Step 6: Testing password hashing...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(body.password || 'test', 12);
    console.log('✅ Password hashing successful');

    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');

    return NextResponse.json(
      {
        message: 'Test registration successful - all steps passed',
        userCount,
        hashedPasswordLength: hashedPassword.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Test registration error:', error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    return NextResponse.json(
      { 
        error: 'Test registration failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 