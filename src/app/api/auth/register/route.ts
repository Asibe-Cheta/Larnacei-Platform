import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email-service';
import { sendOTP } from '@/lib/twilio-service';
import { userRegistrationSchema } from '@/lib/validations';

interface RegistrationRequest {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone: string;
  password: string;
  accountType: 'individual' | 'agent' | 'agency' | 'BUYER' | 'SELLER' | 'AGENT';
  role?: 'USER' | 'ADMIN';
}

interface RegistrationError {
  message: string;
  field?: string;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Registration API called - Fixed accountType mapping');

  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Database configuration is missing. Please contact support.' },
        { status: 503, headers }
      );
    }

    // Test database connection first
    console.log('Testing database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      
      // Provide more specific error information
      let errorMessage = 'Database connection failed. Please try again later.';
      if (dbError instanceof Error) {
        if (dbError.message.includes('ECONNREFUSED')) {
          errorMessage = 'Database server is not accessible. Please try again later.';
        } else if (dbError.message.includes('authentication')) {
          errorMessage = 'Database authentication failed. Please contact support.';
        } else if (dbError.message.includes('does not exist')) {
          errorMessage = 'Database does not exist. Please contact support.';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 503, headers }
      );
    }

    let body: RegistrationRequest;
    try {
      body = await request.json();
      console.log('Request body received:', { ...body, password: '[HIDDEN]' });
    } catch (jsonError) {
      console.error("❌ JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers }
      );
    }

    // Validate request body
    console.log('Validating request body...');
    const validationResult = userRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      const errors: RegistrationError[] = validationResult.error.errors.map(err => ({
        message: err.message,
        field: err.path.join('.')
      }));
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400, headers }
      );
    }
    console.log('Validation passed');

    const { firstName, lastName, name, email, phone, password, accountType, role = 'USER' } = validationResult.data;

    // Handle name field - use firstName + lastName if provided, otherwise use name
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : name;

    // Map account types to match Prisma enum
    let mappedAccountType: 'INDIVIDUAL' | 'AGENT' | 'AGENCY' | 'CORPORATE';
    switch (accountType) {
      case 'individual':
        mappedAccountType = 'INDIVIDUAL';
        break;
      case 'agent':
        mappedAccountType = 'AGENT';
        break;
      case 'agency':
        mappedAccountType = 'AGENCY';
        break;
      default:
        mappedAccountType = 'INDIVIDUAL'; // Default to INDIVIDUAL
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 409, headers }
      );
    }

    console.log('✅ No existing user found, creating new user...');

    // Hash password
    console.log('Hashing password...');
    let hashedPassword;
    try {
      hashedPassword = await hash(password, 12);
      console.log('✅ Password hashed successfully');
    } catch (hashError) {
      console.error('❌ Password hashing failed:', hashError);
      throw new Error(`Password hashing failed: ${hashError instanceof Error ? hashError.message : 'Unknown error'}`);
    }

    // Create user
    console.log('Creating user in database...');
    console.log('User data:', {
      name: fullName,
      email: email.toLowerCase(),
      phone,
      accountType: mappedAccountType,
      role,
      passwordLength: hashedPassword.length
    });
    
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name: fullName,
          email: email.toLowerCase(),
          phone,
          password: hashedPassword,
          accountType: mappedAccountType,
          role,
          isVerified: false,
          verificationLevel: 'NONE',
          kycStatus: 'PENDING',
          contactPreference: 'EMAIL'
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          accountType: true,
          isVerified: true,
          verificationLevel: true,
          kycStatus: true,
          createdAt: true
        }
      });
      console.log('✅ User created successfully:', user.id);
    } catch (createError) {
      console.error('❌ User creation failed:', createError);
      throw new Error(`User creation failed: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
    }

    console.log('✅ User created successfully:', user.id);

    // Send verification email (non-blocking)
    console.log('Sending verification email...');
    sendVerificationEmail(email, fullName, user.id).catch((emailError) => {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails
    });

    // Send OTP to phone (non-blocking)
    console.log('Sending OTP...');
    sendOTP(phone).catch((smsError) => {
      console.error('Error sending OTP:', smsError);
      // Don't fail registration if SMS fails
    });

    console.log('✅ User registered successfully:', user.id);
    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          accountType: user.accountType,
          isVerified: user.isVerified,
          verificationLevel: user.verificationLevel,
          kycStatus: user.kycStatus,
          createdAt: user.createdAt
        }
      },
      { status: 201, headers }
    );

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown error type');
    
    // Try to disconnect from database
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Failed to register user', 
        details: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      },
      { status: 500, headers }
    );
  }
} 