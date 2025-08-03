import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('videos') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No videos provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('video/')) {
        continue; // Skip non-video files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${session.user.id}-video-${i}-${timestamp}.${file.name.split('.').pop()}`;
      const filepath = join(uploadsDir, filename);

      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Add to uploaded URLs
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    });

  } catch (error: any) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload videos' },
      { status: 500 }
    );
  }
} 