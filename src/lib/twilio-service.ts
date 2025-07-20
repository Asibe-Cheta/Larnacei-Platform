import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+15044144413';

// Rate limiting configuration
const smsRateLimits = new Map<string, { count: number; resetTime: number; lastSent: number }>();
const MAX_SMS_PER_HOUR = 10;
const MAX_SMS_PER_DAY = 50;
const MIN_INTERVAL_BETWEEN_SMS = 60000; // 1 minute

// Nigerian phone number validation and formatting
export const validateNigerianPhone = (phoneNumber: string): { isValid: boolean; formatted: string; error?: string } => {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid Nigerian number
  if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
    // Convert 0XXXXXXXXXX to +234XXXXXXXXX
    const formatted = '+234' + cleanNumber.substring(1);
    return { isValid: true, formatted };
  }

  if (cleanNumber.length === 13 && cleanNumber.startsWith('234')) {
    // Already in international format
    const formatted = '+' + cleanNumber;
    return { isValid: true, formatted };
  }

  if (cleanNumber.length === 10 && !cleanNumber.startsWith('0')) {
    // Convert XXXXXXXXXX to +234XXXXXXXXX
    const formatted = '+234' + cleanNumber;
    return { isValid: true, formatted };
  }

  return {
    isValid: false,
    formatted: '',
    error: 'Invalid Nigerian phone number format. Use format: 08012345678 or +2348012345678'
  };
};

// Rate limiting functions
const checkSMSRateLimit = (phoneNumber: string): { allowed: boolean; waitTime?: number } => {
  const now = Date.now();
  const limit = smsRateLimits.get(phoneNumber);

  if (!limit) {
    smsRateLimits.set(phoneNumber, {
      count: 1,
      resetTime: now + 3600000, // 1 hour
      lastSent: now
    });
    return { allowed: true };
  }

  // Check if we're in a new hour
  if (now > limit.resetTime) {
    smsRateLimits.set(phoneNumber, {
      count: 1,
      resetTime: now + 3600000,
      lastSent: now
    });
    return { allowed: true };
  }

  // Check hourly limit
  if (limit.count >= MAX_SMS_PER_HOUR) {
    const waitTime = limit.resetTime - now;
    return { allowed: false, waitTime };
  }

  // Check minimum interval between SMS
  if (now - limit.lastSent < MIN_INTERVAL_BETWEEN_SMS) {
    const waitTime = MIN_INTERVAL_BETWEEN_SMS - (now - limit.lastSent);
    return { allowed: false, waitTime };
  }

  limit.count++;
  limit.lastSent = now;
  return { allowed: true };
};

// Main SMS sending function
export const sendSMS = async (to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Validate and format phone number
    const validation = validateNigerianPhone(to);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Check rate limits
    const rateLimit = checkSMSRateLimit(validation.formatted);
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.waitTime || 0) / 60000);
      return {
        success: false,
        error: `Rate limit exceeded. Please wait ${waitMinutes} minutes before sending another SMS.`
      };
    }

    // Send SMS via Twilio
    const response = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: validation.formatted
    });

    console.log(`SMS sent successfully to ${validation.formatted}`, response.sid);
    return { success: true, messageId: response.sid };

  } catch (error) {
    console.error('Failed to send SMS via Twilio:', error);

    // Handle specific Twilio errors
    if (error instanceof Error) {
      if (error.message.includes('not a valid phone number')) {
        return { success: false, error: 'Invalid phone number format' };
      }
      if (error.message.includes('not verified')) {
        return { success: false, error: 'Phone number not verified with Twilio' };
      }
      if (error.message.includes('insufficient funds')) {
        return { success: false, error: 'Insufficient Twilio account balance' };
      }
    }

    return { success: false, error: 'Failed to send SMS. Please try again later.' };
  }
};

// OTP generation and verification
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP codes (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const storeOTP = (phoneNumber: string, otp: string, expiryMinutes: number = 10): void => {
  const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);
  otpStore.set(phoneNumber, { code: otp, expiresAt });

  // Clean up expired OTPs
  setTimeout(() => {
    otpStore.delete(phoneNumber);
  }, expiryMinutes * 60 * 1000);
};

export const verifyOTP = (phoneNumber: string, otp: string): boolean => {
  const stored = otpStore.get(phoneNumber);
  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return false;
  }

  if (stored.code === otp) {
    otpStore.delete(phoneNumber);
    return true;
  }

  return false;
};

// Send OTP SMS
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; otp?: string; error?: string }> => {
  try {
    const otp = generateOTP();
    
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('Twilio not configured: Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER');
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        storeOTP(phoneNumber, otp, 10);
        console.log('📱 DEVELOPMENT MODE: OTP for', phoneNumber, 'is:', otp);
        return { success: true, otp };
      }
      
      return { success: false, error: 'SMS service not configured' };
    }

    const message = `Your Larnacei verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    
    try {
      const result = await sendSMS(phoneNumber, message);
      
      if (result.success) {
        storeOTP(phoneNumber, otp, 10);
        return { success: true }; // Don't return OTP in production
      } else {
        // Handle unverified numbers in development
        if (process.env.NODE_ENV === 'development' && result.error?.includes('unverified')) {
          storeOTP(phoneNumber, otp, 10);
          console.log('📱 DEVELOPMENT MODE: OTP for', phoneNumber, 'is:', otp);
          console.log('❌ SMS failed (unverified number):', result.error);
          return { success: true, otp };
        }
        
        return { success: false, error: result.error };
      }
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      
      // Development fallback for any SMS error
      if (process.env.NODE_ENV === 'development') {
        storeOTP(phoneNumber, otp, 10);
        console.log('📱 DEVELOPMENT MODE: OTP for', phoneNumber, 'is:', otp);
        console.log('❌ SMS error:', smsError);
        return { success: true, otp };
      }
      
      return { success: false, error: 'Failed to send verification code' };
    }
    
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
};

// Property inquiry SMS templates
export const sendInquiryNotificationSMS = async (
  phoneNumber: string,
  propertyTitle: string,
  inquirerName: string,
  inquiryType: string
): Promise<{ success: boolean; error?: string }> => {
  const message = `New inquiry for ${propertyTitle}: ${inquirerName} is interested in ${inquiryType.toLowerCase().replace('_', ' ')}. Check your email for details. - Larnacei`;

  return await sendSMS(phoneNumber, message);
};

export const sendViewingConfirmationSMS = async (
  phoneNumber: string,
  propertyTitle: string,
  viewingDate: string,
  viewingTime: string
): Promise<{ success: boolean; error?: string }> => {
  const message = `Viewing confirmed for ${propertyTitle} on ${viewingDate} at ${viewingTime}. Check your email for full details. - Larnacei`;

  return await sendSMS(phoneNumber, message);
};

export const sendWelcomeSMS = async (
  phoneNumber: string,
  userName: string
): Promise<{ success: boolean; error?: string }> => {
  const message = `Welcome to Larnacei, ${userName}! Your account has been created successfully. Start exploring properties at larnaceiglobal.com - Larnacei`;

  return await sendSMS(phoneNumber, message);
};

export const sendPropertyUpdateSMS = async (
  phoneNumber: string,
  propertyTitle: string,
  updateType: 'price' | 'status' | 'availability'
): Promise<{ success: boolean; error?: string }> => {
  const updateMessages = {
    price: `Price updated for ${propertyTitle}. Check the latest details on Larnacei.`,
    status: `Status changed for ${propertyTitle}. View updates on Larnacei.`,
    availability: `Availability updated for ${propertyTitle}. Check if it's still available.`
  };

  const message = updateMessages[updateType];
  return await sendSMS(phoneNumber, message);
};

// Bulk SMS sending with rate limiting
export const sendBulkSMS = async (
  phoneNumbers: string[],
  message: string,
  delayBetweenSMS: number = 1000 // 1 second delay between SMS
): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> => {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (let i = 0; i < phoneNumbers.length; i++) {
    const phoneNumber = phoneNumbers[i];

    try {
      const result = await sendSMS(phoneNumber, message);

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${phoneNumber}: ${result.error}`);
      }

      // Add delay between SMS to avoid rate limits
      if (i < phoneNumbers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenSMS));
      }

    } catch (error) {
      results.failed++;
      results.errors.push(`${phoneNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (results.failed > 0) {
    results.success = false;
  }

  return results;
};

// SMS delivery status tracking
export const trackSMSDelivery = async (messageId: string): Promise<any> => {
  try {
    const message = await twilioClient.messages(messageId).fetch();
    return {
      sid: message.sid,
      status: message.status,
      direction: message.direction,
      from: message.from,
      to: message.to,
      body: message.body,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    console.error('Failed to track SMS delivery:', error);
    return null;
  }
};

// Get SMS statistics
export const getSMSStats = async (): Promise<any> => {
  try {
    const messages = await twilioClient.messages.list({
      limit: 100,
      dateSentAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    });

    const stats = {
      total: messages.length,
      delivered: messages.filter(m => m.status === 'delivered').length,
      failed: messages.filter(m => m.status === 'failed').length,
      undelivered: messages.filter(m => m.status === 'undelivered').length,
      sent: messages.filter(m => m.status === 'sent').length,
      queued: messages.filter(m => m.status === 'queued').length
    };

    return stats;
  } catch (error) {
    console.error('Failed to get SMS stats:', error);
    return null;
  }
};

// Webhook verification for Twilio
export const verifyTwilioWebhook = (signature: string, url: string, params: any): boolean => {
  const crypto = require('crypto');
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';

  // Create the string to sign
  const sortedParams = Object.keys(params).sort();
  const paramString = sortedParams.map(key => key + params[key]).join('');
  const stringToSign = url + paramString;

  // Create the signature
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(stringToSign, 'utf-8'))
    .digest('base64');

  return expectedSignature === signature;
};

// Clean up expired rate limits (run periodically)
export const cleanupExpiredRateLimits = (): void => {
  const now = Date.now();
  for (const [phoneNumber, limit] of smsRateLimits.entries()) {
    if (now > limit.resetTime) {
      smsRateLimits.delete(phoneNumber);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredRateLimits, 60 * 60 * 1000); 