import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  maxDuration: 600, // 10 minutes timeout for videos
};

export async function POST(request: NextRequest) {
  try {
    console.log('Video upload request received');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('User agent:', request.headers.get('user-agent'));

    // Debug environment variables
    console.log('Environment variables check:');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

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

    // Parse form data
    const formData = await request.formData();

    // Handle both 'videos' and 'files' keys for mobile compatibility
    let files = formData.getAll('videos') as File[];
    if (files.length === 0) {
      files = formData.getAll('files') as File[];
    }
    if (files.length === 0) {
      files = formData.getAll('video') as File[]; // Mobile fallback
    }

    console.log('Files received:', files.length);

    if (!files || files.length === 0) {
      console.log('No videos provided in request');
      return NextResponse.json(
        { error: 'No videos provided' },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
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
      console.error('Cloudinary configuration missing');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('CLOUDINARY')));

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
      if (!file.type.startsWith('video/')) {
        console.log('Skipping non-video file:', file.name, file.type);
        continue; // Skip non-video files
      }

      // Validate file size (100MB limit for videos)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        console.log('File too large:', file.name, file.size);
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 100MB.` },
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
        const fileExtension = file.name.split('.').pop() || 'mp4';
        const publicId = `larnacei-properties/videos/${session.user.id}-${timestamp}-${randomId}`;

        console.log('Uploading to Cloudinary:', publicId);

        // Upload to Cloudinary with mobile-optimized settings
        const uploadResult = await cloudinary.uploader.upload(base64String, {
          public_id: publicId,
          folder: 'larnacei-properties/videos',
          resource_type: 'video',
          transformation: [
            { width: 1280, height: 720, crop: 'limit' }, // HD resolution
            { quality: 'auto', fetch_format: 'auto' }, // Optimize
            { flags: 'progressive' } // Progressive loading for mobile
          ],
          eager: [
            { width: 640, height: 360, crop: 'limit', quality: 'auto' },
            { width: 320, height: 180, crop: 'limit', quality: 'auto' }
          ],
          eager_async: true,
          eager_notification_url: null,
          chunk_size: 6000000, // 6MB chunks for mobile
          resource_type: 'video'
        });

        console.log('File uploaded successfully to Cloudinary:', uploadResult.secure_url);

        // Add to uploaded URLs
        uploadedUrls.push(uploadResult.secure_url);
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError);

        // Enhanced error handling for mobile
        if (fileError.message?.includes('blob') || fileError.message?.includes('Blob')) {
          return NextResponse.json(
            { error: 'Mobile upload issue detected. Please try again or use a different video.' },
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
    });

  } catch (error: any) {
    console.error('Video upload error:', error);
    console.error('Error stack:', error.stack);

    // Enhanced error handling for mobile issues
    if (error.message?.includes('blob') || error.message?.includes('Blob')) {
      return NextResponse.json(
        { error: 'Mobile upload issue detected. Please try again or use a different video.' },
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
      { error: 'Failed to upload videos', details: error.message },
      { status: 500 }
    );
  }
} 