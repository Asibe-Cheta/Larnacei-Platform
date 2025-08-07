import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD IMAGES API START ===');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    console.log('Files received:', files.length);
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Convert buffer to base64
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        
        console.log('Uploading file:', file.name, 'Size:', file.size);
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            dataURI,
            {
              folder: 'larnacei-properties',
              resource_type: 'auto',
              transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload success:', result?.secure_url);
                resolve(result);
              }
            }
          );
        });
        
        return {
          originalName: file.name,
          url: (result as any).secure_url,
          publicId: (result as any).public_id,
          size: file.size
        };
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        throw error;
      }
    });

    const results = await Promise.all(uploadPromises);
    
    console.log('All uploads completed successfully');
    console.log('Uploaded URLs:', results.map(r => r.url));
    
    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      data: results
    });

  } catch (error) {
    console.error('=== UPLOAD IMAGES API ERROR ===');
    console.error('Error uploading images:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to upload images' },
      { status: 500 }
    );
  }
} 