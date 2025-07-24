# Larnacei Platform - Service Integration Guide

## Overview

This document outlines the integration of real SendGrid and Twilio services for production-ready email and SMS functionality in the Larnacei Property Platform.

## 🔧 Environment Variables Setup

Add these environment variables to your `.env.local` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.zHarZ3ipTUKAxMZJMQuxg.j-t-1kIVW-dBE1tx8t7rBNtOyiHMB-Uy43iwHVGQP1g
SENDGRID_FROM_EMAIL=info@larnaceiglobal.com
SENDGRID_FROM_NAME=Larnacei Property Platform

# Twilio Configuration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Fallback SMTP (if Mailgun is not available)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📧 SendGrid Email Service

### Features

- **Real Email Delivery**: Sends emails via SendGrid API
- **Professional Templates**: Larnacei-branded email templates with #7C0302 colors
- **Rate Limiting**: Prevents spam with hourly and daily limits (100 emails/day free plan)
- **Tracking Support**: Tracks delivery, opens, and clicks
- **Fallback System**: Falls back to nodemailer if SendGrid fails

### Email Types Supported

1. **Inquiry Notifications** - Sent to property owners when someone inquires
2. **Inquiry Confirmations** - Sent to inquirers confirming their inquiry
3. **Message Notifications** - Sent when new messages are received
4. **Viewing Confirmations** - Sent when viewing appointments are confirmed
5. **Welcome Emails** - Sent to new users upon registration
6. **Password Reset Emails** - Sent for password reset requests

### Usage Example

```typescript
import { sendInquiryNotification } from "@/lib/sendgrid-service";

await sendInquiryNotification({
  to: "owner@example.com",
  propertyTitle: "Beautiful 3-Bedroom Villa",
  propertyLocation: "Lekki, Lagos",
  propertyPrice: 50000000, // in kobo
  propertyCurrency: "NGN",
  inquirerName: "John Doe",
  inquirerEmail: "john@example.com",
  inquirerPhone: "+2348012345678",
  message: "I am interested in this property...",
  preferredContact: "EMAIL",
  inquiryType: "PURCHASE_INTENT",
  intendedUse: "Residential",
  budget: "₦50M - ₦60M",
  timeframe: "WITHIN_3_MONTHS",
  financingNeeded: true,
  requestViewing: true,
  viewingDate: "2024-01-15",
  viewingTime: "10:00 AM",
  virtualViewingInterest: false,
});
```

## 📱 Twilio SMS Service

### Features

- **Real SMS Delivery**: Sends SMS via Twilio API
- **Nigerian Phone Validation**: Validates and formats Nigerian numbers (+234)
- **OTP Verification**: Secure OTP generation and verification
- **Rate Limiting**: Prevents spam with hourly limits and minimum intervals
- **Webhook Support**: Tracks SMS delivery status
- **Multiple SMS Types**: Inquiry notifications, viewing confirmations, welcome messages

### Nigerian Phone Number Formats Supported

- `08012345678` → `+2348012345678`
- `+2348012345678` → `+2348012345678`
- `8012345678` → `+2348012345678`

### SMS Types Supported

1. **OTP Verification** - For phone number verification
2. **Inquiry Notifications** - Quick SMS alerts for property inquiries
3. **Viewing Confirmations** - SMS confirmations for viewing appointments
4. **Welcome Messages** - Welcome SMS for new users
5. **Property Updates** - Notifications for price/status changes
6. **Custom Messages** - Any custom SMS content

### Usage Example

```typescript
import { sendOTP, verifyOTP } from "@/lib/twilio-service";

// Send OTP
const result = await sendOTP("08012345678");
if (result.success) {
  console.log("OTP sent successfully");
}

// Verify OTP
const isValid = verifyOTP("08012345678", "123456");
if (isValid) {
  console.log("OTP verified successfully");
}
```

## 🌐 API Endpoints

### Email Endpoints

All email functionality is handled through the existing email service with automatic SendGrid integration.

### SMS Endpoints

#### Send OTP

```http
POST /api/sms/otp/send
Content-Type: application/json

{
  "phoneNumber": "08012345678"
}
```

#### Verify OTP

```http
POST /api/sms/otp/verify
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "otp": "123456"
}
```

#### Send SMS

```http
POST /api/sms/send
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "type": "inquiry_notification",
  "data": {
    "propertyTitle": "Beautiful Villa",
    "inquirerName": "John Doe",
    "inquiryType": "PURCHASE_INTENT"
  }
}
```

### Webhook Endpoints

#### SendGrid Event Webhook

```http
POST /api/webhooks/sendgrid
```

Handles email delivery events:

- `delivered` - Email successfully delivered
- `bounced` - Email bounced
- `spam_report` - Email marked as spam
- `opened` - Email opened
- `clicked` - Link in email clicked
- `unsubscribed` - User unsubscribed
- `dropped` - Email dropped

#### Twilio Webhook

```http
POST /api/webhooks/twilio
```

Handles SMS delivery events:

- `delivered` - SMS successfully delivered
- `failed` - SMS failed to deliver
- `undelivered` - SMS undelivered
- `sent` - SMS sent to carrier
- `queued` - SMS queued for delivery

## 🔒 Security Features

### Rate Limiting

- **Email**: 50 emails per hour per recipient
- **SMS**: 10 SMS per hour per phone number
- **Minimum Interval**: 1 minute between SMS to same number

### Webhook Verification

- **Mailgun**: HMAC-SHA256 signature verification
- **Twilio**: HMAC-SHA1 signature verification

### OTP Security

- **Expiration**: 10 minutes
- **One-time use**: OTP is deleted after verification
- **Rate limiting**: Prevents OTP spam

## 📊 Monitoring & Analytics

### Email Statistics

```typescript
import { getEmailStats } from "@/lib/sendgrid-service";

const stats = await getEmailStats();
// Returns delivery, bounce, and complaint statistics (limited on free plan)
```

### SMS Statistics

```typescript
import { getSMSStats } from "@/lib/twilio-service";

const stats = await getSMSStats();
// Returns delivery, failure, and queue statistics
```

### SMS Delivery Tracking

```typescript
import { trackSMSDelivery } from "@/lib/twilio-service";

const status = await trackSMSDelivery("message_sid");
// Returns detailed delivery status
```

## 🚀 Production Deployment

### 1. Environment Setup

- Add all required environment variables
- Ensure SendGrid sender email is verified
- Verify Twilio phone number

### 2. Webhook Configuration

#### SendGrid Webhooks

Configure these webhook URLs in your SendGrid dashboard:

- `https://yourdomain.com/api/webhooks/sendgrid`

Events to track:

- `delivered`
- `bounced`
- `spam_report`
- `opened`
- `clicked`
- `unsubscribed`
- `dropped`

#### Twilio Webhooks

Configure these webhook URLs in your Twilio dashboard:

- `https://yourdomain.com/api/webhooks/twilio`

Events to track:

- `delivered`
- `failed`
- `undelivered`
- `sent`
- `queued`

### 3. Testing

#### Email Testing

```typescript
// Test welcome email
await sendWelcomeEmail({
  to: "test@example.com",
  userName: "Test User",
  verificationUrl: "https://example.com/verify",
});
```

#### SMS Testing

```typescript
// Test OTP
const result = await sendOTP("08012345678");
console.log(result.success ? "OTP sent" : result.error);
```

### 4. Monitoring

- Monitor webhook endpoints for delivery status
- Check rate limiting logs
- Track email and SMS statistics
- Monitor error rates and failures

## 🔧 Troubleshooting

### Common Issues

#### Email Not Sending

1. Check SendGrid API key and sender email
2. Verify SMTP credentials for fallback
3. Check rate limits (100 emails/day free plan)
4. Review webhook configuration

#### SMS Not Sending

1. Verify Twilio credentials
2. Check phone number format
3. Ensure sufficient Twilio balance
4. Review rate limiting settings

#### Webhook Issues

1. Verify webhook URLs are accessible
2. Check signature verification
3. Review webhook event configuration
4. Monitor webhook logs

### Error Handling

- All services include comprehensive error handling
- Fallback mechanisms for service failures
- Detailed logging for debugging
- Rate limiting to prevent abuse

## 📈 Performance Optimization

### Email Optimization

- HTML and text versions for better deliverability
- Professional templates with Larnacei branding
- Tracking enabled for analytics
- Rate limiting to prevent spam

### SMS Optimization

- Nigerian phone number validation
- Rate limiting to prevent abuse
- Template-based messages for consistency
- Delivery tracking for reliability

## 🔄 Migration from Mailgun to SendGrid

The integration maintains backward compatibility with existing code:

1. **Email Service**: Automatically uses SendGrid with nodemailer fallback
2. **SMS Service**: Twilio integration with existing WhatsApp functionality
3. **API Endpoints**: All existing endpoints continue to work
4. **Webhooks**: Updated webhook endpoints for SendGrid delivery tracking

All existing functionality continues to work while using SendGrid for improved reliability.

## 📞 Support

For technical support or questions about the service integration:

- **Email**: info@larnaceiglobal.com
- **Phone**: +234-XXX-XXX-XXXX
- **Documentation**: This README and inline code comments

---

**Note**: This integration provides production-ready email and SMS capabilities while maintaining the existing user experience and Nigerian market optimization.
