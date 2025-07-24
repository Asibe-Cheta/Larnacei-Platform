import { NextRequest, NextResponse } from 'next/server';
import { trackEmailDelivery } from '@/lib/sendgrid-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const events = JSON.parse(body);

    console.log(`SendGrid webhook received: ${events.length} events`);

    for (const event of events) {
      const {
        event: eventType,
        sg_message_id: messageId,
        email: recipient,
        timestamp: eventTimestamp,
        reason,
        'delivery-status': deliveryStatus,
        url,
        useragent,
        ip
      } = event;

      console.log(`SendGrid event: ${eventType} for ${recipient}`);

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

        case 'spam_report':
          await trackEmailDelivery(messageId, 'spam_report');
          console.log(`Email spam reported: ${messageId} by ${recipient}`);
          break;

        case 'opened':
          await trackEmailDelivery(messageId, 'opened');
          console.log(`Email opened: ${messageId} by ${recipient}`);
          break;

        case 'clicked':
          await trackEmailDelivery(messageId, 'clicked');
          console.log(`Email clicked: ${messageId} by ${recipient}, url: ${url}`);
          break;

        case 'unsubscribed':
          await trackEmailDelivery(messageId, 'unsubscribed');
          console.log(`Email unsubscribed: ${messageId} by ${recipient}`);
          break;

        case 'dropped':
          await trackEmailDelivery(messageId, 'dropped');
          console.log(`Email dropped: ${messageId} to ${recipient}, reason: ${reason}`);
          break;

        case 'deferred':
          await trackEmailDelivery(messageId, 'deferred');
          console.log(`Email deferred: ${messageId} to ${recipient}, reason: ${reason}`);
          break;

        case 'processed':
          await trackEmailDelivery(messageId, 'processed');
          console.log(`Email processed: ${messageId} to ${recipient}`);
          break;

        default:
          console.log(`Unhandled SendGrid event: ${eventType}`);
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
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('SendGrid webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SendGrid Webhook Endpoint',
    status: 'active',
    events: [
      'delivered',
      'bounced',
      'spam_report',
      'opened',
      'clicked',
      'unsubscribed',
      'dropped',
      'deferred',
      'processed'
    ]
  });
} 