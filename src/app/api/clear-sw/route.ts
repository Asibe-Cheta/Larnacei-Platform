import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Service worker clear instructions',
      instructions: [
        '1. Open browser developer tools (F12)',
        '2. Go to Application tab',
        '3. Click on Service Workers in the left sidebar',
        '4. Click "Unregister" for any existing service workers',
        '5. Or add this to your browser console:',
        '   navigator.serviceWorker.getRegistrations().then(function(registrations) {',
        '     for(let registration of registrations) {',
        '       registration.unregister();',
        '     }',
        '   });'
      ],
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
} 