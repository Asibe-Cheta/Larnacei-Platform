import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure for larger uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 300, // 5 minutes timeout
};

// Set maximum file size for Vercel (4.5MB to stay under 5MB limit)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

export async function POST(request: NextRequest) {
  try {
    console.log('Image upload request received');
    
    // Add content type header for proper JSON response
    const responseHeaders = {
      'Content-Type': 'application/json',
    };

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.id);

    // Parse form data with increased size limit
    const formData = await request.formData();

    // Handle both 'images' and 'files' keys for mobile compatibility
    let files = formData.getAll('images') as File[];
    if (files.length === 0) {
      files = formData.getAll('files') as File[];
    }
    if (files.length === 0) {
      files = formData.getAll('image') as File[]; // Mobile fallback
    }

    console.log('Files received:', files.length);

    if (!files || files.length === 0) {
      console.log('No images provided in request');
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    const cloudinaryVars = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    if (!cloudinaryVars.cloud_name || !cloudinaryVars.api_key || !cloudinaryVars.api_secret) {
      console.error('Cloudinary configuration missing');
      return NextResponse.json(
        { error: 'Upload service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('Cloudinary is configured, uploading to cloud storage');
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i + 1}/${files.length}:`, file.name, file.type, file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Skipping non-image file:', file.name, file.type);
        continue; // Skip non-image files
      }

      // Validate file size (4.5MB limit for Vercel)
      if (file.size > MAX_FILE_SIZE) {
        console.log('File too large:', file.name, file.size);
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 4.5MB for images.` },
          { status: 400 }
        );
      }

      try {
        // Convert file to base64 for Cloudinary (mobile-compatible)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Generate unique filename with timestamp for mobile compatibility
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const publicId = `larnacei-properties/images/${session.user.id}-${timestamp}-${randomId}`;

        console.log('Uploading to Cloudinary:', publicId);

        // Upload to Cloudinary with mobile-optimized settings
        const uploadResult = await cloudinary.uploader.upload(base64String, {
          public_id: publicId,
          folder: 'larnacei-properties/images',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit' }, // HD resolution
            { quality: 'auto', fetch_format: 'auto' }, // Optimize
            { flags: 'progressive' } // Progressive loading for mobile
          ],
          eager: [
            { width: 1280, height: 720, crop: 'limit', quality: 'auto' },
            { width: 640, height: 360, crop: 'limit', quality: 'auto' },
            { width: 320, height: 180, crop: 'limit', quality: 'auto' }
          ],
          eager_async: true,
          eager_notification_url: null,
        });

        console.log('File uploaded successfully to Cloudinary:', uploadResult.secure_url);

        // Add to uploaded URLs
        uploadedUrls.push(uploadResult.secure_url);
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError);

        // Enhanced error handling for mobile
        if (fileError.message?.includes('blob') || fileError.message?.includes('Blob')) {
          return NextResponse.json(
            { error: 'Mobile upload issue detected. Please try again or use a different image.' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: `Failed to process file ${file.name}: ${fileError.message}` },
          { status: 500 }
        );
      }
    }

    console.log('Upload completed successfully. URLs:', uploadedUrls);

    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    }, { headers: responseHeaders });

  } catch (error: any) {
    console.error('Image upload error:', error);
    console.error('Error stack:', error.stack);

    // Enhanced error handling for mobile issues
    if (error.message?.includes('blob') || error.message?.includes('Blob')) {
      return NextResponse.json(
        { error: 'Mobile upload issue detected. Please try again or use a different image.' },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors specifically
    if (error.message?.includes('JSON.parse') || error.message?.includes('unexpected character')) {
      return NextResponse.json(
        { error: 'Invalid response format. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload images', details: error.message },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 