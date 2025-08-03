import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SENDGRID SIMPLE TEST START ===');

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
    const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME;

    console.log('Environment variables:', {
      hasApiKey: !!SENDGRID_API_KEY,
      apiKeyLength: SENDGRID_API_KEY?.length || 0,
      apiKeyPrefix: SENDGRID_API_KEY?.substring(0, 10) + '...' || 'Not set',
      fromEmail: SENDGRID_FROM_EMAIL,
      fromName: SENDGRID_FROM_NAME
    });

    if (!SENDGRID_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'SendGrid API key not configured',
        message: 'Please add SENDGRID_API_KEY to your environment variables'
      });
    }

    // Validate API key format
    if (!SENDGRID_API_KEY.startsWith('SG.')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid SendGrid API key format',
        message: 'API key should start with SG.'
      });
    }

    if (SENDGRID_API_KEY.length < 50) {
      return NextResponse.json({
        success: false,
        error: 'SendGrid API key appears to be truncated',
        message: 'API key should be at least 50 characters long'
      });
    }

    // Configure SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Test configuration without sending email
    const testMsg = {
      to: 'test@example.com',
      from: `${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`,
      subject: 'SendGrid Test - Larnacei',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    };

    console.log('Test message configuration:', {
      to: testMsg.to,
      from: testMsg.from,
      subject: testMsg.subject
    });

    // Note: We're not actually sending the email, just validating the configuration
    console.log('SendGrid configuration appears valid');
    console.log('=== SENDGRID SIMPLE TEST SUCCESS ===');

    return NextResponse.json({
      success: true,
      message: 'SendGrid configuration appears valid',
      configuration: {
        apiKeyValid: true,
        apiKeyLength: SENDGRID_API_KEY.length,
        fromEmail: SENDGRID_FROM_EMAIL,
        fromName: SENDGRID_FROM_NAME,
        testMessage: testMsg
      }
    });

  } catch (error) {
    console.error('=== SENDGRID SIMPLE TEST ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 