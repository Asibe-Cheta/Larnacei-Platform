import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Image upload request received');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);

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
        // Convert file to base64 for temporary storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const filename = `${session.user.id}-${i}-${timestamp}.${fileExtension}`;

        console.log('File processed successfully:', filename);

        // For now, return the base64 data as a temporary solution
        // In production, this should be uploaded to cloud storage (Cloudinary, AWS S3, etc.)
        uploadedUrls.push(base64String);
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError);
        return NextResponse.json(
          { error: `Failed to process file ${file.name}: ${fileError.message}` },
          { status: 500 }
        );
      }
    }

    console.log('Upload completed successfully. Files processed:', uploadedUrls.length);

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: 'Images processed successfully. For production, configure cloud storage (Cloudinary, AWS S3, etc.)'
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