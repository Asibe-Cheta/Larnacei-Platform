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

// Fallback to nodemailer if SendGrid is not configured
import nodemailer from 'nodemailer';

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'info@larnaceiglobal.com';

// Nodemailer configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASSWORD;

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

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
            <p>&copy; 2024 Larnacei. All rights reserved.</p>
            <p>This email was sent from Larnacei's secure notification system.</p>
        </div>
    </div>
</body>
</html>
`;

export const sendInquiryNotification = async (data: InquiryNotificationData) => {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      const success = await sendInquiryNotificationSendGrid(data);
      if (success) {
        console.log('Inquiry notification email sent via SendGrid');
        return;
      }
    }

    // Fallback to nodemailer
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

      ${data.requestViewing && data.viewingDate && data.viewingTime ? `
      <div class="info-box">
          <h3>Viewing Request</h3>
          <p><strong>Date:</strong> ${new Date(data.viewingDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${data.viewingTime}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${data.inquirerEmail}" class="btn">Reply via Email</a>
          ${data.preferredContact === 'WHATSAPP' ? `<a href="https://wa.me/${data.inquirerPhone.replace(/\D/g, '')}" class="btn btn-outline">Reply via WhatsApp</a>` : ''}
          <a href="tel:${data.inquirerPhone}" class="btn btn-outline">Call Inquirer</a>
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-radius: 6px;">
          <p><strong>💡 Quick Tips:</strong></p>
          <ul>
              <li>Respond within 24 hours to maintain good ratings</li>
              <li>Be professional and courteous in all communications</li>
              <li>Provide detailed information about the property</li>
              <li>Follow up with viewing arrangements if requested</li>
          </ul>
      </div>
    `;

    const mailOptions = {
      from: `"Larnacei" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: `New Inquiry: ${data.propertyTitle} - ${data.inquirerName}`,
      html: createEmailTemplate(content, 'New Property Inquiry'),
    };

    await transporter.sendMail(mailOptions);
    console.log('Inquiry notification email sent via nodemailer');
  } catch (error) {
    console.error('Failed to send inquiry notification email:', error);
  }
};

export const sendInquiryConfirmation = async (data: InquiryConfirmationData) => {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      const success = await sendInquiryConfirmationSendGrid(data);
      if (success) {
        console.log('Inquiry confirmation email sent via SendGrid');
        return;
      }
    }

    // Fallback to nodemailer
    const content = `
      <h2>Inquiry Confirmation</h2>
      
      <p>Dear <span class="highlight">${data.inquirerName}</span>,</p>
      
      <p>Thank you for your interest in our property. Your inquiry has been successfully sent to the property owner.</p>

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

      <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${data.ownerEmail}" class="btn">Contact Owner</a>
          <a href="tel:${data.ownerPhone}" class="btn btn-outline">Call Owner</a>
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-radius: 6px;">
          <p><strong>📞 Next Steps:</strong></p>
          <ul>
              <li>The property owner will contact you within 24 hours</li>
              <li>You can also reach out directly using the contact information above</li>
              <li>Prepare any questions you may have about the property</li>
              <li>If you requested a viewing, the owner will confirm the details</li>
          </ul>
      </div>
    `;

    const mailOptions = {
      from: `"Larnacei" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: `Inquiry Confirmation: ${data.propertyTitle}`,
      html: createEmailTemplate(content, 'Inquiry Confirmation'),
    };

    await transporter.sendMail(mailOptions);
    console.log('Inquiry confirmation email sent via nodemailer');
  } catch (error) {
    console.error('Failed to send inquiry confirmation email:', error);
  }
};

export const sendMessageNotification = async (data: MessageNotificationData) => {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      const success = await sendMessageNotificationSendGrid(data);
      if (success) {
        console.log('Message notification email sent via SendGrid');
        return;
      }
    }

    // Fallback to nodemailer
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

    const mailOptions = {
      from: `"Larnacei" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: `New Message: ${data.propertyTitle}`,
      html: createEmailTemplate(content, 'New Message'),
    };

    await transporter.sendMail(mailOptions);
    console.log('Message notification email sent via nodemailer');
  } catch (error) {
    console.error('Failed to send message notification email:', error);
  }
};

export const sendViewingConfirmation = async (data: ViewingConfirmationData) => {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      const success = await sendViewingConfirmationSendGrid(data);
      if (success) {
        console.log('Viewing confirmation email sent via SendGrid');
        return;
      }
    }

    // Fallback to nodemailer
    const content = `
      <h2>Viewing Appointment Confirmed</h2>
      
      <p>Dear <span class="highlight">${data.inquirerName}</span>,</p>
      
      <p>Your viewing appointment has been confirmed. Please find the details below:</p>

      <div class="property-details">
          <h3>Property Details</h3>
          <p><strong>Title:</strong> ${data.propertyTitle}</p>
          <p><strong>Location:</strong> ${data.propertyLocation}</p>
      </div>

      <div class="info-box">
          <h3>Viewing Appointment</h3>
          <p><strong>Date:</strong> ${new Date(data.viewingDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${data.viewingTime}</p>
          ${data.directions ? `<p><strong>Directions:</strong> ${data.directions}</p>` : ''}
      </div>

      <div class="contact-info">
          <h3>Property Owner Contact</h3>
          <p><strong>Name:</strong> ${data.ownerName}</p>
          <p><strong>Phone:</strong> ${data.ownerPhone}</p>
          <p><strong>Email:</strong> ${data.ownerEmail}</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
          <a href="tel:${data.ownerPhone}" class="btn">Call Owner</a>
          <a href="mailto:${data.ownerEmail}" class="btn btn-outline">Email Owner</a>
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-radius: 6px;">
          <p><strong>📋 What to Bring:</strong></p>
          <ul>
              <li>Valid ID (Driver's License, National ID, or Passport)</li>
              <li>Proof of income or financial capability</li>
              <li>List of questions about the property</li>
              <li>Camera for photos (if permitted)</li>
          </ul>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 6px;">
          <p><strong>⚠️ Important Notes:</strong></p>
          <ul>
              <li>Please arrive 5-10 minutes before the scheduled time</li>
              <li>If you need to reschedule, contact the owner at least 24 hours in advance</li>
              <li>Follow all COVID-19 safety protocols if applicable</li>
          </ul>
      </div>
    `;

    const mailOptions = {
      from: `"Larnacei" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: `Viewing Confirmed: ${data.propertyTitle}`,
      html: createEmailTemplate(content, 'Viewing Confirmation'),
    };

    await transporter.sendMail(mailOptions);
    console.log('Viewing confirmation email sent via nodemailer');
  } catch (error) {
    console.error('Failed to send viewing confirmation email:', error);
  }
};

// Welcome email function
export const sendWelcomeEmail = async (data: { to: string; userName: string; verificationUrl?: string }) => {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      const success = await sendWelcomeEmailSendGrid(data);
      if (success) {
        console.log('Welcome email sent via SendGrid');
        return;
      }
    }

    // Fallback to nodemailer
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
      ` : ''}

      <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-radius: 6px;">
          <p><strong>🚀 Getting Started:</strong></p>
          <ul>
              <li>Complete your profile to get better property matches</li>
              <li>Set up your property preferences</li>
              <li>Save your favorite properties</li>
              <li>Enable notifications for new listings</li>
          </ul>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 6px;">
          <p><strong>📞 Need Help?</strong></p>
          <p>Our support team is available 24/7 to assist you. Contact us at support@larnaceiglobal.com or call +234-XXX-XXX-XXXX.</p>
      </div>
    `;

    const mailOptions = {
      from: `"Larnacei" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: 'Welcome to Larnacei - Nigeria\'s Premier Property Marketplace',
      html: createEmailTemplate(content, 'Welcome to Larnacei'),
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent via nodemailer');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// Password reset email function
export const sendPasswordResetEmail = async (data: { to: string; userName: string; resetUrl: string; expiryHours: number }) => {
  try {
    console.log('sendPasswordResetEmail called with:', {
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
      return true;
    }

    // Check if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key found, attempting SendGrid email...');
      const success = await sendPasswordResetEmailSendGrid(data);
      if (success) {
        console.log('Password reset email sent via SendGrid');
        return true;
      } else {
        console.log('SendGrid email failed, falling back to nodemailer');
      }
    } else {
      console.log('SendGrid API key not found, using nodemailer');
    }

    // Check if nodemailer is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_HOST) {
      console.error('Nodemailer not configured - missing SMTP_USER or SMTP_HOST');
      return false;
    }

    console.log('Attempting to send email via nodemailer...');

    // Fallback to nodemailer
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

    const mailOptions = {
      from: `"Larnacei" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: 'Password Reset Request - Larnacei',
      html: createEmailTemplate(content, 'Password Reset'),
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent via nodemailer');
    return true;
  } catch (error) {
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

export const sendVerificationEmail = async (email: string, userName: string, userId: string) => {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${userId}`;

    // Try SendGrid first
    if (SENDGRID_API_KEY) {
      const success = await sendVerificationEmailSendGrid(email, userName, userId);

      if (success) {
        console.log('Verification email sent via SendGrid');
        return;
      }
    }

    // Fallback to nodemailer
    if (SMTP_USER && SMTP_HOST) {
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
            <h3>What's Next?</h3>
            <ul>
                <li>Browse thousands of properties across Nigeria</li>
                <li>Connect with verified real estate agents</li>
                <li>List your own properties for sale or rent</li>
                <li>Get instant notifications for new listings</li>
            </ul>
        </div>
        
        <div class="info-box">
            <h3>Need Help?</h3>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team:</p>
            <ul>
                <li>Email: info@larnaceiglobal.com</li>
                <li>Phone: +234 800 LARNACEI</li>
                <li>WhatsApp: +234 800 LARNACEI</li>
            </ul>
        </div>
        
        <p>Best regards,<br>The Larnacei Team</p>
      `;

      const mailOptions = {
        from: SMTP_USER,
        to: email,
        subject: 'Verify Your Email - Welcome to Larnacei',
        html: createEmailTemplate(content, 'Email Verification - Larnacei'),
      };

      await transporter.sendMail(mailOptions);
      console.log('Verification email sent via nodemailer');
      return;
    }

    // Development fallback
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 DEVELOPMENT MODE: Email verification link:', verificationUrl);
      console.log('📧 Would send verification email to:', email);
      return;
    }

    throw new Error('No email service configured');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}; 