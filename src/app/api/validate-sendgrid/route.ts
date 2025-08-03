import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Validating SendGrid configuration...');

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
    const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME;

    // Validation checks
    const validations = {
      apiKeyExists: !!SENDGRID_API_KEY,
      apiKeyFormat: SENDGRID_API_KEY?.startsWith('SG.') || false,
      apiKeyLength: SENDGRID_API_KEY?.length || 0,
      fromEmailExists: !!SENDGRID_FROM_EMAIL,
      fromNameExists: !!SENDGRID_FROM_NAME,
      fromEmailValid: SENDGRID_FROM_EMAIL?.includes('@') || false
    };

    const issues = [];
    
    if (!validations.apiKeyExists) {
      issues.push('SendGrid API key is missing');
    } else if (!validations.apiKeyFormat) {
      issues.push('SendGrid API key format is invalid (should start with SG.)');
    } else if (validations.apiKeyLength < 50) {
      issues.push('SendGrid API key appears to be truncated or too short');
    }

    if (!validations.fromEmailExists) {
      issues.push('SENDGRID_FROM_EMAIL is missing');
    } else if (!validations.fromEmailValid) {
      issues.push('SENDGRID_FROM_EMAIL format is invalid');
    }

    if (!validations.fromNameExists) {
      issues.push('SENDGRID_FROM_NAME is missing');
    }

    const isValid = issues.length === 0;

    console.log('SendGrid validation results:', {
      isValid,
      issues,
      validations
    });

    return NextResponse.json({
      success: true,
      isValid,
      issues,
      validations: {
        ...validations,
        apiKeyPrefix: SENDGRID_API_KEY?.substring(0, 10) + '...' || 'Not set'
      },
      recommendations: isValid ? [] : [
        'Check your SendGrid API key in Vercel environment variables',
        'Ensure the API key is complete and not truncated',
        'Verify the sender email is properly configured',
        'Make sure the sender name is set'
      ]
    });

  } catch (error) {
    console.error('SendGrid validation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 