import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing SendGrid configuration...');

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
    const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME;

    console.log('SendGrid configuration:', {
      hasApiKey: !!SENDGRID_API_KEY,
      fromEmail: SENDGRID_FROM_EMAIL,
      fromName: SENDGRID_FROM_NAME
    });

    if (!SENDGRID_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'SendGrid API key not configured'
      });
    }

    // Configure SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Test email configuration
    const testMsg = {
      to: 'test@example.com',
      from: `${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`,
      subject: 'SendGrid Test - Larnacei',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    };

    console.log('Attempting to send test email...');
    
    // Note: We won't actually send the email in this test, just validate the configuration
    // In a real test, you would use: const response = await sgMail.send(testMsg);
    
    // Instead, let's just check if the API key format is valid
    const apiKeyValid = SENDGRID_API_KEY.startsWith('SG.') && SENDGRID_API_KEY.length > 50;
    
    return NextResponse.json({
      success: true,
      configuration: {
        apiKeyValid,
        apiKeyLength: SENDGRID_API_KEY.length,
        fromEmail: SENDGRID_FROM_EMAIL,
        fromName: SENDGRID_FROM_NAME
      },
      message: apiKeyValid ? 'SendGrid configuration appears valid' : 'SendGrid API key format may be invalid'
    });

  } catch (error) {
    console.error('SendGrid test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 