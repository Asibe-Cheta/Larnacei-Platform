import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 Simple Registration Test called');

  try {
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[HIDDEN]' });

    return NextResponse.json(
      {
        message: 'Simple registration test successful',
        receivedData: { ...body, password: '[HIDDEN]' },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Simple registration test error:', error);
    return NextResponse.json(
      { error: 'Simple test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 