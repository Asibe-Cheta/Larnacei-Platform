import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Cloudinary configuration...');
    
    const cloudinaryVars = {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
    };

    console.log('Cloudinary environment variables:', cloudinaryVars);

    // Check if all required variables are set
    const allSet = cloudinaryVars.CLOUDINARY_CLOUD_NAME === 'SET' && 
                   cloudinaryVars.CLOUDINARY_API_KEY === 'SET' && 
                   cloudinaryVars.CLOUDINARY_API_SECRET === 'SET';

    return NextResponse.json({
      success: true,
      cloudinaryConfigured: allSet,
      environment: cloudinaryVars,
      message: allSet ? 'Cloudinary is properly configured' : 'Cloudinary configuration is missing'
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
} 