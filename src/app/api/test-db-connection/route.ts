import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection string...');

    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;

    console.log('DATABASE_URL exists:', !!databaseUrl);
    console.log('DIRECT_URL exists:', !!directUrl);

    if (databaseUrl) {
      console.log('DATABASE_URL starts with:', databaseUrl.substring(0, 20) + '...');
    }

    if (directUrl) {
      console.log('DIRECT_URL starts with:', directUrl.substring(0, 20) + '...');
    }

    return NextResponse.json({
      success: true,
      databaseUrlExists: !!databaseUrl,
      directUrlExists: !!directUrl,
      message: 'Database connection string check completed'
    });

  } catch (error) {
    console.error('Database connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 