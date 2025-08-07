import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    console.log('=== TEST IMAGE UPLOAD API ===');
    
    // Check Cloudinary configuration
    const cloudinaryVars = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    console.log('Cloudinary configuration check:', {
      cloud_name_set: !!cloudinaryVars.cloud_name,
      api_key_set: !!cloudinaryVars.api_key,
      api_secret_set: !!cloudinaryVars.api_secret,
      all_set: !!(cloudinaryVars.cloud_name && cloudinaryVars.api_key && cloudinaryVars.api_secret)
    });

    if (!cloudinaryVars.cloud_name || !cloudinaryVars.api_key || !cloudinaryVars.api_secret) {
      return NextResponse.json({
        success: false,
        message: 'Cloudinary configuration missing',
        details: {
          cloud_name_set: !!cloudinaryVars.cloud_name,
          api_key_set: !!cloudinaryVars.api_key,
          api_secret_set: !!cloudinaryVars.api_secret,
        }
      });
    }

    // Test Cloudinary connection
    try {
      const result = await cloudinary.api.ping();
      console.log('Cloudinary ping result:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Cloudinary connection successful',
        data: {
          status: result.status,
          cloudinary_config: {
            cloud_name: cloudinaryVars.cloud_name,
            api_key_length: cloudinaryVars.api_key?.length || 0,
            api_secret_length: cloudinaryVars.api_secret?.length || 0,
          }
        }
      });
    } catch (cloudinaryError: any) {
      console.error('Cloudinary connection error:', cloudinaryError);
      
      return NextResponse.json({
        success: false,
        message: 'Cloudinary connection failed',
        error: cloudinaryError.message
      });
    }

  } catch (error: any) {
    console.error('Test image upload API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
}
