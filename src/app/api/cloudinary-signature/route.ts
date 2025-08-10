import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('Cloudinary signature request received');
    
    // Get Cloudinary configuration from environment variables
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    console.log('Cloudinary config check:', {
      cloud_name: cloud_name ? 'Set' : 'Missing',
      api_key: api_key ? 'Set' : 'Missing',
      api_secret: api_secret ? 'Set' : 'Missing'
    });

    if (!cloud_name || !api_key || !api_secret) {
      console.error('Cloudinary environment variables not configured');
      return NextResponse.json(
        { error: 'Cloudinary not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true
    });
    
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

    // Ensure parameters are properly formatted for Cloudinary signature
    // Cloudinary expects parameters in alphabetical order for signature generation
    const sortedParams: Record<string, any> = {};
    
    // Include all parameters that should be signed
    Object.keys(params_to_sign).sort().forEach(key => {
      // Make sure we include resource_type in the signature
      if (params_to_sign[key] !== undefined && params_to_sign[key] !== null && params_to_sign[key] !== '') {
        sortedParams[key] = params_to_sign[key];
      }
    });

    console.log('Sorted params for signature:', sortedParams);

    // Create the string to sign manually to ensure all parameters are included
    const paramsToSign = Object.keys(sortedParams)
      .sort()
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    
    console.log('String to sign:', paramsToSign);

    // Generate signature manually to ensure it's correct
    // Create the string to sign according to Cloudinary's specification
    const stringToSign = Object.keys(sortedParams)
      .sort()
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    
    console.log('Manual string to sign:', stringToSign);
    
    // Create SHA1 hash of the string + API secret
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign + api_secret)
      .digest('hex');

    console.log('Manual signature generated:', signature);

    // Also try Cloudinary's built-in method for comparison
    const cloudinarySignature = cloudinary.utils.api_sign_request(
      sortedParams,
      api_secret
    );

    console.log('Cloudinary built-in signature:', cloudinarySignature);

    return NextResponse.json({
      signature,
      api_key,
      cloud_name,
    });

  } catch (error: any) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature', details: error.message },
      { status: 500 }
    );
  }
}
