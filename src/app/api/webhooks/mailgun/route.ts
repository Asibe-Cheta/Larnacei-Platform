import { NextRequest, NextResponse } from 'next/server';
import { verifyMailgunWebhook, trackEmailDelivery } from '@/lib/mailgun-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    // Extract webhook data
    const timestamp = params.get('timestamp') || '';
    const token = params.get('token') || '';
    const signature = params.get('signature') || '';
    const eventData = params.get('event-data') || '';
    
    // Verify webhook signature
    if (!verifyMailgunWebhook(timestamp, token, signature)) {
      console.error('Invalid Mailgun webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse event data
    let event;
    try {
      event = JSON.parse(eventData);
    } catch (error) {
      console.error('Failed to parse Mailgun event data:', error);
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
    }
    
    const {
      event: eventType,
      message: { headers: { 'message-id': messageId } = {} },
      recipient,
      domain,
      timestamp: eventTimestamp,
      reason,
      code,
      'delivery-status': deliveryStatus
    } = event;
    
    console.log(`Mailgun webhook received: ${eventType} for ${recipient}`);
    
    // Handle different event types
    switch (eventType) {
      case 'delivered':
        await trackEmailDelivery(messageId, 'delivered');
        console.log(`Email delivered: ${messageId} to ${recipient}`);
        break;
        
      case 'bounced':
        await trackEmailDelivery(messageId, 'bounced');
        console.log(`Email bounced: ${messageId} to ${recipient}, reason: ${reason}`);
        break;
        
      case 'complained':
        await trackEmailDelivery(messageId, 'complained');
        console.log(`Email complained: ${messageId} to ${recipient}`);
        break;
        
      case 'opened':
        await trackEmailDelivery(messageId, 'opened');
        console.log(`Email opened: ${messageId} by ${recipient}`);
        break;
        
      case 'clicked':
        await trackEmailDelivery(messageId, 'clicked');
        console.log(`Email clicked: ${messageId} by ${recipient}`);
        break;
        
      case 'unsubscribed':
        await trackEmailDelivery(messageId, 'unsubscribed');
        console.log(`Email unsubscribed: ${messageId} by ${recipient}`);
        break;
        
      case 'dropped':
        await trackEmailDelivery(messageId, 'dropped');
        console.log(`Email dropped: ${messageId} to ${recipient}, reason: ${reason}`);
        break;
        
      default:
        console.log(`Unhandled Mailgun event: ${eventType}`);
    }
    
    // Store event in database for analytics (optional)
    // await prisma.emailEvent.create({
    //   data: {
    //     messageId,
    //     recipient,
    //     eventType,
    //     timestamp: new Date(parseInt(eventTimestamp) * 1000),
    //     metadata: event
    //   }
    // });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Mailgun webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Mailgun webhook endpoint is active' });
} 