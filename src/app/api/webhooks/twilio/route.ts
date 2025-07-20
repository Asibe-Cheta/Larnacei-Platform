import { NextRequest, NextResponse } from 'next/server';
import { verifyTwilioWebhook } from '@/lib/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    // Extract webhook data
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;
    
    // Verify webhook signature
    const paramObject: any = {};
    params.forEach((value, key) => {
      paramObject[key] = value;
    });
    
    if (!verifyTwilioWebhook(signature, url, paramObject)) {
      console.error('Invalid Twilio webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Extract SMS data
    const messageSid = params.get('MessageSid') || '';
    const messageStatus = params.get('MessageStatus') || '';
    const to = params.get('To') || '';
    const from = params.get('From') || '';
    const bodyText = params.get('Body') || '';
    const errorCode = params.get('ErrorCode') || '';
    const errorMessage = params.get('ErrorMessage') || '';
    
    console.log(`Twilio webhook received: ${messageStatus} for ${to}`);
    
    // Handle different status types
    switch (messageStatus) {
      case 'delivered':
        console.log(`SMS delivered: ${messageSid} to ${to}`);
        // Update database with delivery status
        // await prisma.smsEvent.create({
        //   data: {
        //     messageSid,
        //     to,
        //     from,
        //     status: 'delivered',
        //     timestamp: new Date()
        //   }
        // });
        break;
        
      case 'failed':
        console.log(`SMS failed: ${messageSid} to ${to}, error: ${errorMessage}`);
        // Update database with failure status
        // await prisma.smsEvent.create({
        //   data: {
        //     messageSid,
        //     to,
        //     from,
        //     status: 'failed',
        //     errorCode,
        //     errorMessage,
        //     timestamp: new Date()
        //   }
        // });
        break;
        
      case 'undelivered':
        console.log(`SMS undelivered: ${messageSid} to ${to}`);
        // Update database with undelivered status
        // await prisma.smsEvent.create({
        //   data: {
        //     messageSid,
        //     to,
        //     from,
        //     status: 'undelivered',
        //     timestamp: new Date()
        //   }
        // });
        break;
        
      case 'sent':
        console.log(`SMS sent: ${messageSid} to ${to}`);
        // Update database with sent status
        // await prisma.smsEvent.create({
        //   data: {
        //     messageSid,
        //     to,
        //     from,
        //     status: 'sent',
        //     timestamp: new Date()
        //   }
        // });
        break;
        
      case 'queued':
        console.log(`SMS queued: ${messageSid} to ${to}`);
        // Update database with queued status
        // await prisma.smsEvent.create({
        //   data: {
        //     messageSid,
        //     to,
        //     from,
        //     status: 'queued',
        //     timestamp: new Date()
        //   }
        // });
        break;
        
      default:
        console.log(`Unhandled Twilio status: ${messageStatus}`);
    }
    
    // Handle incoming SMS (if configured)
    if (messageStatus === 'received') {
      console.log(`Incoming SMS from ${from}: ${bodyText}`);
      
      // Process incoming SMS for OTP verification or other purposes
      // await processIncomingSMS(from, bodyText);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Twilio webhook endpoint is active' });
} 