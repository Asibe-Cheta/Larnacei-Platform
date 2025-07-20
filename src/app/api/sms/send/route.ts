import { NextRequest, NextResponse } from 'next/server';
import { 
  sendSMS, 
  sendInquiryNotificationSMS, 
  sendViewingConfirmationSMS, 
  sendWelcomeSMS, 
  sendPropertyUpdateSMS,
  validateNigerianPhone 
} from '@/lib/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const { 
      phoneNumber, 
      message, 
      type, 
      data 
    } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Validate phone number format
    const validation = validateNigerianPhone(phoneNumber);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    let result;
    
    // Handle different SMS types
    switch (type) {
      case 'inquiry_notification':
        if (!data?.propertyTitle || !data?.inquirerName || !data?.inquiryType) {
          return NextResponse.json(
            { error: 'Missing required data for inquiry notification' },
            { status: 400 }
          );
        }
        result = await sendInquiryNotificationSMS(
          phoneNumber,
          data.propertyTitle,
          data.inquirerName,
          data.inquiryType
        );
        break;
        
      case 'viewing_confirmation':
        if (!data?.propertyTitle || !data?.viewingDate || !data?.viewingTime) {
          return NextResponse.json(
            { error: 'Missing required data for viewing confirmation' },
            { status: 400 }
          );
        }
        result = await sendViewingConfirmationSMS(
          phoneNumber,
          data.propertyTitle,
          data.viewingDate,
          data.viewingTime
        );
        break;
        
      case 'welcome':
        if (!data?.userName) {
          return NextResponse.json(
            { error: 'Missing required data for welcome SMS' },
            { status: 400 }
          );
        }
        result = await sendWelcomeSMS(phoneNumber, data.userName);
        break;
        
      case 'property_update':
        if (!data?.propertyTitle || !data?.updateType) {
          return NextResponse.json(
            { error: 'Missing required data for property update SMS' },
            { status: 400 }
          );
        }
        result = await sendPropertyUpdateSMS(
          phoneNumber,
          data.propertyTitle,
          data.updateType
        );
        break;
        
      case 'custom':
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required for custom SMS' },
            { status: 400 }
          );
        }
        result = await sendSMS(phoneNumber, message);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid SMS type' },
          { status: 400 }
        );
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        messageId: 'messageId' in result ? result.messageId : undefined
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
} 