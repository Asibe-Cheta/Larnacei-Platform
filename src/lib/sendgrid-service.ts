import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'info@larnaceiglobal.com';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Larnacei Property Platform';

// Configure SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Rate limiting configuration
const emailRateLimits = new Map<string, { count: number; resetTime: number }>();
const MAX_EMAILS_PER_HOUR = 50;
const MAX_EMAILS_PER_DAY = 100; // Free plan limit

// Email templates with Larnacei branding (#7C0302 colors)
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
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 4px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Larnacei</h1>
            <p>Nigeria's Premier Property Marketplace</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; 2024 Larnacei Global Limited. All rights reserved.</p>
            <p>This email was sent from a notification-only address that cannot accept incoming email.</p>
        </div>
    </div>
</body>
</html>
`;

// Rate limiting functions
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const limit = emailRateLimits.get(identifier);

  if (!limit) {
    emailRateLimits.set(identifier, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }

  if (now > limit.resetTime) {
    emailRateLimits.set(identifier, { count: 1, resetTime: now + 3600000 });
    return true;
  }

  if (limit.count >= MAX_EMAILS_PER_HOUR) {
    return false;
  }

  limit.count++;
  return true;
};

// Main email sending function with error handling and retry logic
export const sendEmail = async (data: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}): Promise<boolean> => {
  try {
    // Validate SendGrid configuration
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return false;
    }

    // Validate API key format
    if (!SENDGRID_API_KEY.startsWith('SG.')) {
      console.error('Invalid SendGrid API key format - should start with SG.');
      return false;
    }

    if (SENDGRID_API_KEY.length < 50) {
      console.error('SendGrid API key appears to be truncated or invalid');
      return false;
    }

    // Check rate limits
    const identifier = data.to.split('@')[0]; // Use email prefix as identifier
    if (!checkRateLimit(identifier)) {
      console.error(`Rate limit exceeded for ${data.to}`);
      return false;
    }

    console.log('SendGrid configuration validated, attempting to send email...');

    const msg = {
      to: data.to,
      from: data.from || `${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`,
      subject: data.subject,
      html: data.html,
      text: data.text || data.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      replyTo: data.replyTo || SENDGRID_FROM_EMAIL,
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true
        },
        openTracking: {
          enable: true
        }
      },
      categories: ['larnacei-notification'],
      customArgs: {
        emailType: 'transactional'
      }
    };

    console.log('Sending email with configuration:', {
      to: data.to,
      from: msg.from,
      subject: data.subject,
      apiKeyLength: SENDGRID_API_KEY.length,
      apiKeyPrefix: SENDGRID_API_KEY.substring(0, 10) + '...'
    });

    const response = await sgMail.send(msg);

    console.log(`Email sent successfully to ${data.to}`, response);
    return true;
  } catch (error) {
    console.error('Failed to send email via SendGrid:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        recipient: data.to,
        subject: data.subject,
        apiKeyLength: SENDGRID_API_KEY?.length || 0,
        apiKeyPrefix: SENDGRID_API_KEY?.substring(0, 10) + '...' || 'Not set'
      });
    }

    return false;
  }
};

// Interface definitions
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

// Inquiry notification email
export const sendInquiryNotification = async (data: InquiryNotificationData): Promise<boolean> => {
  const content = `
    <h2>New Property Inquiry Received</h2>
    
    <div class="property-details">
        <h3>Property Details</h3>
        <p><strong>Title:</strong> ${data.propertyTitle}</p>
        <p><strong>Location:</strong> ${data.propertyLocation}</p>
        <p><strong>Price:</strong> ₦${(data.propertyPrice / 100).toLocaleString()}</p>
    </div>

    <div class="contact-info">
        <h3>Inquirer Information</h3>
        <p><strong>Name:</strong> ${data.inquirerName}</p>
        <p><strong>Email:</strong> ${data.inquirerEmail}</p>
        <p><strong>Phone:</strong> ${data.inquirerPhone}</p>
        <p><strong>Preferred Contact:</strong> ${data.preferredContact}</p>
    </div>

    <div class="info-box">
        <h3>Inquiry Details</h3>
        <p><strong>Type:</strong> ${data.inquiryType.replace('_', ' ')}</p>
        ${data.intendedUse ? `<p><strong>Intended Use:</strong> ${data.intendedUse}</p>` : ''}
        ${data.budget ? `<p><strong>Budget:</strong> ${data.budget}</p>` : ''}
        ${data.timeframe ? `<p><strong>Timeframe:</strong> ${data.timeframe.replace('_', ' ')}</p>` : ''}
        ${data.financingNeeded ? '<p><strong>Financing Needed:</strong> Yes</p>' : ''}
        ${data.requestViewing ? '<p><strong>Viewing Requested:</strong> Yes</p>' : ''}
        ${data.virtualViewingInterest ? '<p><strong>Virtual Viewing Interest:</strong> Yes</p>' : ''}
    </div>

    <div class="info-box">
        <h3>Message</h3>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
    </div>

    ${data.requestViewing && data.viewingDate ? `
    <div class="info-box">
        <h3>Viewing Request</h3>
        <p><strong>Date:</strong> ${data.viewingDate}</p>
        <p><strong>Time:</strong> ${data.viewingTime}</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/inquiries" class="btn">View All Inquiries</a>
    </div>
  `;

  return await sendEmail({
    to: data.to,
    subject: `New Inquiry: ${data.propertyTitle}`,
    html: createEmailTemplate(content, 'New Property Inquiry'),
    tracking: true
  });
};

// Inquiry confirmation email
export const sendInquiryConfirmation = async (data: InquiryConfirmationData): Promise<boolean> => {
  const content = `
    <h2>Inquiry Confirmation</h2>
    
    <p>Dear <span class="highlight">${data.inquirerName}</span>,</p>
    
    <p>Thank you for your interest in our property. We have received your inquiry and will get back to you shortly.</p>

    <div class="property-details">
        <h3>Property Details</h3>
        <p><strong>Title:</strong> ${data.propertyTitle}</p>
        <p><strong>Location:</strong> ${data.propertyLocation}</p>
        <p><strong>Price:</strong> ₦${(data.propertyPrice / 100).toLocaleString()}</p>
    </div>

    <div class="contact-info">
        <h3>Property Owner Contact</h3>
        <p><strong>Name:</strong> ${data.ownerName}</p>
        <p><strong>Phone:</strong> ${data.ownerPhone}</p>
        <p><strong>Email:</strong> ${data.ownerEmail}</p>
    </div>

    <div class="info-box">
        <h3>What's Next?</h3>
        <ul>
            <li>The property owner will contact you within 24 hours</li>
            <li>You can schedule a viewing if interested</li>
            <li>Feel free to ask any questions about the property</li>
            <li>Check your dashboard for updates on your inquiry</li>
        </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/inquiries" class="btn">View My Inquiries</a>
    </div>
  `;

  return await sendEmail({
    to: data.to,
    subject: `Inquiry Confirmation: ${data.propertyTitle}`,
    html: createEmailTemplate(content, 'Inquiry Confirmation'),
    tracking: true
  });
};

// Message notification email
export const sendMessageNotification = async (data: MessageNotificationData): Promise<boolean> => {
  const content = `
    <h2>New Message Received</h2>
    
    <p>You have received a new message from <span class="highlight">${data.senderName}</span> regarding your property.</p>

    <div class="property-details">
        <h3>Property</h3>
        <p><strong>Title:</strong> ${data.propertyTitle}</p>
    </div>

    <div class="info-box">
        <h3>Message Preview</h3>
        <p>${data.messagePreview.length > 100 ? data.messagePreview.substring(0, 100) + '...' : data.messagePreview}</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${data.conversationUrl}" class="btn">View Full Conversation</a>
    </div>
  `;

  return await sendEmail({
    to: data.to,
    subject: `New Message: ${data.propertyTitle}`,
    html: createEmailTemplate(content, 'New Message'),
    tracking: true
  });
};

// Viewing confirmation email
export const sendViewingConfirmation = async (data: ViewingConfirmationData): Promise<boolean> => {
  const content = `
    <h2>Property Viewing Confirmed</h2>
    
    <p>Dear <span class="highlight">${data.inquirerName}</span>,</p>
    
    <p>Your property viewing has been confirmed. Here are the details:</p>

    <div class="property-details">
        <h3>Property Details</h3>
        <p><strong>Title:</strong> ${data.propertyTitle}</p>
        <p><strong>Location:</strong> ${data.propertyLocation}</p>
    </div>

    <div class="contact-info">
        <h3>Viewing Details</h3>
        <p><strong>Date:</strong> ${data.viewingDate}</p>
        <p><strong>Time:</strong> ${data.viewingTime}</p>
    </div>

    <div class="info-box">
        <h3>Property Owner Contact</h3>
        <p><strong>Name:</strong> ${data.ownerName}</p>
        <p><strong>Phone:</strong> ${data.ownerPhone}</p>
        <p><strong>Email:</strong> ${data.ownerEmail}</p>
    </div>

    ${data.directions ? `
    <div class="info-box">
        <h3>Directions</h3>
        <p>${data.directions}</p>
    </div>
    ` : ''}

    <div class="info-box">
        <h3>Important Notes</h3>
        <ul>
            <li>Please arrive 5 minutes before the scheduled time</li>
            <li>Bring a valid ID for verification</li>
            <li>Contact the owner if you need to reschedule</li>
            <li>Take photos and notes during the viewing</li>
        </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/inquiries" class="btn">View My Inquiries</a>
    </div>
  `;

  return await sendEmail({
    to: data.to,
    subject: `Viewing Confirmed: ${data.propertyTitle}`,
    html: createEmailTemplate(content, 'Viewing Confirmation'),
    tracking: true
  });
};

// Welcome email function
export const sendWelcomeEmail = async (data: { to: string; userName: string; verificationUrl?: string }): Promise<boolean> => {
  const content = `
    <h2>Welcome to Larnacei!</h2>
    
    <p>Dear <span class="highlight">${data.userName}</span>,</p>
    
    <p>Welcome to Nigeria's Premier Property Marketplace! We're excited to have you join our community of property seekers and owners.</p>

    <div class="info-box">
        <h3>What You Can Do on Larnacei:</h3>
        <ul>
            <li>Browse thousands of properties across Nigeria</li>
            <li>Connect directly with property owners</li>
            <li>Schedule property viewings</li>
            <li>Get real-time notifications about new properties</li>
            <li>Access detailed property information and photos</li>
        </ul>
    </div>

    ${data.verificationUrl ? `
    <div style="text-align: center; margin-top: 30px;">
        <a href="${data.verificationUrl}" class="btn">Verify Your Email</a>
    </div>
    
    <div class="info-box">
        <p><strong>⚠️ Important:</strong> Please verify your email address to unlock all features and receive important notifications.</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/properties" class="btn">Start Browsing Properties</a>
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/list-property" class="btn btn-outline">List Your Property</a>
    </div>
  `;

  return await sendEmail({
    to: data.to,
    subject: 'Welcome to Larnacei - Nigeria\'s Premier Property Marketplace',
    html: createEmailTemplate(content, 'Welcome to Larnacei'),
    tracking: true
  });
};

// Password reset email function
export const sendPasswordResetEmail = async (data: { to: string; userName: string; resetUrl: string; expiryHours: number }): Promise<boolean> => {
  try {
    console.log('=== SENDGRID PASSWORD RESET EMAIL START ===');
    console.log('SendGrid password reset data:', {
      to: data.to,
      userName: data.userName,
      resetUrl: data.resetUrl,
      expiryHours: data.expiryHours
    });

    const content = `
    <h2>Password Reset Request</h2>
    
    <p>Dear <span class="highlight">${data.userName}</span>,</p>
    
    <p>We received a request to reset your password for your Larnacei account. Click the button below to create a new password:</p>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${data.resetUrl}" class="btn">Reset Password</a>
    </div>

    <div class="info-box">
        <p><strong>⚠️ Important:</strong></p>
        <ul>
            <li>This link will expire in ${data.expiryHours} hours</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>For security, this link can only be used once</li>
        </ul>
    </div>

    <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 6px;">
        <p><strong>🔒 Security Tips:</strong></p>
        <ul>
            <li>Use a strong, unique password</li>
            <li>Never share your password with anyone</li>
            <li>Enable two-factor authentication if available</li>
            <li>Log out from shared devices</li>
        </ul>
    </div>
  `;

    console.log('Calling sendEmail function...');
    const result = await sendEmail({
      to: data.to,
      subject: 'Password Reset Request - Larnacei',
      html: createEmailTemplate(content, 'Password Reset'),
      tracking: true
    });

    console.log('SendGrid password reset email result:', result);
    console.log('=== SENDGRID PASSWORD RESET EMAIL END ===');
    
    return result;
  } catch (error) {
    console.error('=== SENDGRID PASSWORD RESET EMAIL ERROR ===');
    console.error('Error in sendPasswordResetEmail:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return false;
  }
};

// Email verification function
export const sendInquiryResponseNotificationSendGrid = async (data: {
  to: string;
  from: string;
  subject: string;
  html: string;
}): Promise<boolean> => {
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured');
    return false;
  }

  try {
    console.log('Sending inquiry response notification via SendGrid...');
    
    const msg = {
      to: data.to,
      from: {
        email: data.from,
        name: SENDGRID_FROM_NAME,
      },
      subject: data.subject,
      html: data.html,
    };

    const response = await sgMail.send(msg);
    console.log('Inquiry response notification sent successfully:', response[0].statusCode);
    return true;
  } catch (error) {
    console.error('Failed to send inquiry response notification via SendGrid:', error);
    return false;
  }
};

export const sendVerificationEmail = async (email: string, userName: string, userId: string): Promise<boolean> => {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${userId}`;

  const content = `
    <h2>Welcome to Larnacei!</h2>
    
    <p>Hi ${userName},</p>
    
    <p>Thank you for registering with Larnacei - Nigeria's Premier Property Marketplace!</p>
    
    <div class="info-box">
        <h3>Verify Your Email Address</h3>
        <p>To complete your registration and start using our platform, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" class="btn">Verify Email Address</a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #7C0302;">${verificationUrl}</a>
        </p>
    </div>

    <div class="info-box">
        <h3>Why Verify Your Email?</h3>
        <ul>
            <li>Unlock all platform features</li>
            <li>Receive important notifications</li>
            <li>Connect with property owners</li>
            <li>Get updates on your inquiries</li>
        </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/properties" class="btn">Start Browsing Properties</a>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email - Larnacei Property Platform',
    html: createEmailTemplate(content, 'Email Verification'),
    tracking: true
  });
};

// Email delivery status tracking
export const trackEmailDelivery = async (messageId: string, status: string): Promise<void> => {
  try {
    // Here you would typically update your database with the delivery status
    console.log(`Email delivery status for ${messageId}: ${status}`);

    // You could also send this to your analytics service
    // await analytics.track('email_delivery', { messageId, status });
  } catch (error) {
    console.error('Failed to track email delivery:', error);
  }
};

// Get email statistics (SendGrid doesn't provide this directly, but you can implement it)
export const getEmailStats = async (): Promise<any> => {
  try {
    // SendGrid doesn't provide stats in the same way as Mailgun
    // You would need to implement your own tracking
    console.log('Email stats not available with SendGrid free plan');
    return null;
  } catch (error) {
    console.error('Failed to get email stats:', error);
    return null;
  }
};

// Test email function for development
export const sendTestEmail = async (to: string): Promise<boolean> => {
  const content = `
    <h2>Test Email from Larnacei</h2>
    
    <p>This is a test email to verify that SendGrid is working correctly.</p>
    
    <div class="info-box">
        <h3>Test Details</h3>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
        <p><strong>SendGrid API:</strong> ${SENDGRID_API_KEY ? 'Configured' : 'Not Configured'}</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="btn">Visit Larnacei</a>
    </div>
  `;

  return await sendEmail({
    to,
    subject: 'Test Email - Larnacei Property Platform',
    html: createEmailTemplate(content, 'Test Email'),
    tracking: false
  });
}; 