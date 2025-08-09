import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle larger request bodies for upload endpoints
  if (request.nextUrl.pathname.startsWith('/api/upload-')) {
    // Set headers for larger uploads
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/upload-images/:path*',
    '/api/upload-videos/:path*',
  ],
};
