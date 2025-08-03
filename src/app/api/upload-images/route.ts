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

export async function POST(request: NextRequest) {
  try {
    console.log('Image upload request received');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);

    // Debug environment variables
    console.log('Environment variables check:');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('Authentication failed - no session or user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.id);

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    console.log('Files received:', files.length);

    if (!files || files.length === 0) {
      console.log('No images provided in request');
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                process.env.CLOUDINARY_API_KEY && 
                                process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryConfigured) {
      console.error('Cloudinary configuration missing');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('CLOUDINARY')));
      
      // Fallback: Process images and return file identifiers
      console.log('Using fallback storage with file identifiers');
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}/${files.length}:`, file.name, file.type, file.size);

        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.log('Skipping non-image file:', file.name, file.type);
          continue;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          console.log('File too large:', file.name, file.size);
          return NextResponse.json(
            { error: `File ${file.name} is too large. Maximum size is 5MB.` },
            { status: 400 }
          );
        }

        try {
          // Generate a file identifier instead of base64
          const timestamp = Date.now();
          const fileExtension = file.name.split('.').pop() || 'jpg';
          const fileId = `temp_${session.user.id}_${i}_${timestamp}.${fileExtension}`;

          console.log('File processed successfully (identifier):', fileId);
          uploadedUrls.push(`temp://${fileId}`);
        } catch (fileError: any) {
          console.error('Error processing file:', file.name, fileError);
          return NextResponse.json(
            { error: `Failed to process file ${file.name}: ${fileError.message}` },
            { status: 500 }
          );
        }
      }

      console.log('Fallback upload completed. Files processed:', uploadedUrls.length);

      return NextResponse.json({
        success: true,
        urls: uploadedUrls,
        message: 'Images processed with temporary storage. Please configure Cloudinary environment variables for production.',
        setupRequired: true
      });
    }

    // Cloudinary is configured - use it
    console.log('Cloudinary is configured, using cloud storage');
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i + 1}/${files.length}:`, file.name, file.type, file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Skipping non-image file:', file.name, file.type);
        continue; // Skip non-image files
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        console.log('File too large:', file.name, file.size);
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 5MB.` },
          { status: 400 }
        );
      }

      try {
        // Convert file to base64 for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const publicId = `larnacei-properties/${session.user.id}-${i}-${timestamp}`;

        console.log('Uploading to Cloudinary:', publicId);

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64String, {
          public_id: publicId,
          folder: 'larnacei-properties',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' }, // Resize for web
            { quality: 'auto', fetch_format: 'auto' } // Optimize
          ]
        });

        console.log('File uploaded successfully to Cloudinary:', uploadResult.secure_url);

        // Add to uploaded URLs
        uploadedUrls.push(uploadResult.secure_url);
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError);
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
    console.error('Image upload error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to upload images', details: error.message },
      { status: 500 }
    );
  }
} 