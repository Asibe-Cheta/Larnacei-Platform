import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('Cloudinary signature request received');
    
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
      console.error('Cloudinary environment variables not configured');
      return NextResponse.json(
        { error: 'Cloudinary not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    cloudinary.config(cloudinaryConfig);
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { params_to_sign } = body;

    if (!params_to_sign) {
      return NextResponse.json(
        { error: 'Missing parameters to sign' },
        { status: 400 }
      );
    }

    console.log('Params to sign:', params_to_sign);

    // Generate signature for Cloudinary upload
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      cloudinaryConfig.api_secret
    );

    console.log('Signature generated successfully');

    return NextResponse.json({
      signature,
      api_key: cloudinaryConfig.api_key,
      cloud_name: cloudinaryConfig.cloud_name,
    });

  } catch (error: any) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature', details: error.message },
      { status: 500 }
    );
  }
}
