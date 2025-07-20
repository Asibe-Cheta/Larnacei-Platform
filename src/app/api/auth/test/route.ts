import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'NextAuth API is working',
    timestamp: new Date().toISOString(),
    env: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV
    }
  });
} 