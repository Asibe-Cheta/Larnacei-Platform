// Import the new SendGrid service functions
import {
  sendInquiryNotification as sendInquiryNotificationSendGrid,
  sendInquiryConfirmation as sendInquiryConfirmationSendGrid,
  sendMessageNotification as sendMessageNotificationSendGrid,
  sendViewingConfirmation as sendViewingConfirmationSendGrid,
  sendWelcomeEmail as sendWelcomeEmailSendGrid,
  sendPasswordResetEmail as sendPasswordResetEmailSendGrid,
  sendVerificationEmail as sendVerificationEmailSendGrid
} from './sendgrid-service';

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'info@larnaceiglobal.com';

interface InquiryNotificationData {
  to: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  propertyCurrency: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone: string;
  message: string;
  preferredContact: string;
  inquiryType: string;
  intendedUse?: string;
  budget?: string;
  timeframe?: string;
  financingNeeded: boolean;
  requestViewing: boolean;
  viewingDate?: string;
  viewingTime?: string;
  virtualViewingInterest: boolean;
}

interface InquiryConfirmationData {
  to: string;
  inquirerName: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  propertyCurrency: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
}

interface MessageNotificationData {
  to: string;
  senderName: string;
  propertyTitle: string;
  messagePreview: string;
  conversationUrl: string;
}

interface ViewingConfirmationData {
  to: string;
  inquirerName: string;
  propertyTitle: string;
  propertyLocation: string;
  viewingDate: string;
  viewingTime: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  directions?: string;
}

// Email templates with Larnacei branding
const createEmailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #7C0302;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #7C0302;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 10px 5px;
        }
        .btn-outline {
            background-color: transparent;
            color: #7C0302;
            border: 2px solid #7C0302;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #7C0302;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .property-details {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .contact-info {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .highlight {
            color: #7C0302;
            font-weight: 600;
        }
        .text-center {
            text-align: center;
        }
        .text-muted {
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Larnacei Global Limited</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; 2024 Larnacei Global Limited. All rights reserved.</p>
            <p class="text-muted">Nigeria's Premier Property Marketplace</p>
        </div>
    </div>
</body>
</html>
`;

// Email service functions - SendGrid only
export const sendInquiryNotification = async (data: InquiryNotificationData) => {
  try {
    console.log('Sending inquiry notification via SendGrid...');
    const success = await sendInquiryNotificationSendGrid(data);
    if (success) {
      console.log('Inquiry notification sent successfully via SendGrid');
      return true;
    } else {
      console.error('Failed to send inquiry notification via SendGrid');
      return false;
    }
  } catch (error) {
    console.error('Error sending inquiry notification:', error);
    return false;
  }
};

export const sendInquiryConfirmation = async (data: InquiryConfirmationData) => {
  try {
    console.log('Sending inquiry confirmation via SendGrid...');
    const success = await sendInquiryConfirmationSendGrid(data);
    if (success) {
      console.log('Inquiry confirmation sent successfully via SendGrid');
      return true;
    } else {
      console.error('Failed to send inquiry confirmation via SendGrid');
      return false;
    }
  } catch (error) {
    console.error('Error sending inquiry confirmation:', error);
    return false;
  }
};

export const sendMessageNotification = async (data: MessageNotificationData) => {
  try {
    console.log('Sending message notification via SendGrid...');
    const success = await sendMessageNotificationSendGrid(data);
    if (success) {
      console.log('Message notification sent successfully via SendGrid');
      return true;
    } else {
      console.error('Failed to send message notification via SendGrid');
      return false;
    }
  } catch (error) {
    console.error('Error sending message notification:', error);
    return false;
  }
};

export const sendViewingConfirmation = async (data: ViewingConfirmationData) => {
  try {
    console.log('Sending viewing confirmation via SendGrid...');
    const success = await sendViewingConfirmationSendGrid(data);
    if (success) {
      console.log('Viewing confirmation sent successfully via SendGrid');
      return true;
    } else {
      console.error('Failed to send viewing confirmation via SendGrid');
      return false;
    }
  } catch (error) {
    console.error('Error sending viewing confirmation:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (data: { to: string; userName: string; verificationUrl?: string }) => {
  try {
    console.log('Sending welcome email via SendGrid...');
    const success = await sendWelcomeEmailSendGrid(data);
    if (success) {
      console.log('Welcome email sent successfully via SendGrid');
      return true;
    } else {
      console.error('Failed to send welcome email via SendGrid');
      return false;
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Password reset email function - SendGrid only
export const sendPasswordResetEmail = async (data: { to: string; userName: string; resetUrl: string; expiryHours: number }) => {
  try {
    console.log('=== SEND PASSWORD RESET EMAIL START ===');
    console.log('Email data:', {
      to: data.to,
      userName: data.userName,
      resetUrl: data.resetUrl,
      expiryHours: data.expiryHours
    });

    // Development fallback - log the reset link instead of sending email
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 DEVELOPMENT MODE: Password reset link:', data.resetUrl);
      console.log('📧 Would send password reset email to:', data.to);
      console.log('👤 User name:', data.userName);
      console.log('=== SEND PASSWORD RESET EMAIL SUCCESS (DEV) ===');
      return true;
    }

    console.log('Production mode - using SendGrid only...');

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      console.error('Please add SENDGRID_API_KEY to your environment variables');
      console.log('=== SEND PASSWORD RESET EMAIL FAILED (NO SENDGRID) ===');
      return false;
    }

    console.log('SendGrid API key found, attempting to send email...');
    console.log('SendGrid configuration:', {
      apiKeyLength: process.env.SENDGRID_API_KEY.length,
      apiKeyPrefix: process.env.SENDGRID_API_KEY.substring(0, 10) + '...',
      fromEmail: process.env.SENDGRID_FROM_EMAIL,
      fromName: process.env.SENDGRID_FROM_NAME
    });

    try {
      const success = await sendPasswordResetEmailSendGrid(data);
      if (success) {
        console.log('Password reset email sent successfully via SendGrid');
        console.log('=== SEND PASSWORD RESET EMAIL SUCCESS (SENDGRID) ===');
        return true;
      } else {
        console.error('SendGrid email service returned false');
        console.log('=== SEND PASSWORD RESET EMAIL FAILED (SENDGRID FALSE) ===');
        return false;
      }
    } catch (sendgridError) {
      console.error('SendGrid error:', sendgridError);
      console.log('=== SEND PASSWORD RESET EMAIL FAILED (SENDGRID ERROR) ===');
      return false;
    }

  } catch (error) {
    console.error('=== SEND PASSWORD RESET EMAIL ERROR ===');
    console.error('Failed to send password reset email:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Email error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return false;
  }
};

interface InquiryResponseNotificationData {
  inquirerEmail: string;
  inquirerName: string;
  propertyTitle: string;
  ownerName: string;
  response: string;
}

export const sendInquiryResponseNotification = async (data: InquiryResponseNotificationData) => {
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured, skipping email notification');
    return;
  }

  try {
    console.log('Attempting to send inquiry response notification via SendGrid...');
    
    const emailContent = `
      <h2>Response to Your Property Inquiry</h2>
      <p>Hello ${data.inquirerName},</p>
      <p>You have received a response to your inquiry about <strong>${data.propertyTitle}</strong>.</p>
      <p><strong>From:</strong> ${data.ownerName}</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; white-space: pre-wrap;">${data.response}</p>
      </div>
      <p>Thank you for your interest in our properties.</p>
      <p>Best regards,<br>Larnacei Global Limited</p>
    `;

    const emailData = {
      to: data.inquirerEmail,
      from: SENDGRID_FROM_EMAIL,
      subject: `Response to Your Inquiry - ${data.propertyTitle}`,
      html: createEmailTemplate(emailContent, 'Inquiry Response'),
    };

    await sendInquiryResponseNotificationSendGrid(emailData);
    console.log('Inquiry response notification sent successfully via SendGrid');
  } catch (error) {
    console.error('Failed to send inquiry response notification via SendGrid:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email: string, userName: string, userId: string) => {
  try {
    console.log('Sending verification email via SendGrid...');
    const success = await sendVerificationEmailSendGrid(email, userName, userId);
    if (success) {
      console.log('Verification email sent successfully via SendGrid');
      return true;
    } else {
      console.error('Failed to send verification email via SendGrid');
      return false;
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}; 