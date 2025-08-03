# Email Setup Guide for Password Reset

## Current Issue
The password reset functionality is failing because email services are not properly configured. This guide will help you set up email services to fix the issue.

## Quick Fix Options

### Option 1: SendGrid (Recommended)
1. Sign up for a free SendGrid account at https://sendgrid.com
2. Create an API key in your SendGrid dashboard
3. Add these environment variables to your Vercel project:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=info@larnaceiglobal.com
   SENDGRID_FROM_NAME=Larnacei Property Platform
   ```

### Option 2: Gmail SMTP
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for your application
3. Add these environment variables to your Vercel project:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password_here
   ```

### Option 3: Outlook/Hotmail SMTP
1. Enable 2-factor authentication on your Outlook account
2. Generate an App Password
3. Add these environment variables to your Vercel project:
   ```
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your_email@outlook.com
   SMTP_PASSWORD=your_app_password_here
   ```

## Testing the Configuration

### 1. Debug Endpoint
Visit: `https://your-domain.vercel.app/api/debug/forgot-password`

This will show you:
- Current environment configuration
- Database connection status
- Email service status
- Specific recommendations for your setup

### 2. Test Email Endpoint
Visit: `https://your-domain.vercel.app/api/test-email`

This will test the email sending functionality.

### 3. Test Database Endpoint
Visit: `https://your-domain.vercel.app/api/test-db`

This will test the database connection.

## Environment Variables Checklist

Make sure these are set in your Vercel project settings:

### Required for All Environments:
- [ ] `NEXTAUTH_URL` (should be your production URL)
- [ ] `DATABASE_URL` (your database connection string)
- [ ] `DIRECT_URL` (your direct database connection string)

### For SendGrid (Option 1):
- [ ] `SENDGRID_API_KEY`
- [ ] `SENDGRID_FROM_EMAIL`
- [ ] `SENDGRID_FROM_NAME`

### For SMTP (Option 2 or 3):
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`

## Vercel Deployment Steps

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each environment variable listed above
5. Redeploy your application

## Troubleshooting

### If you're still getting 500 errors:

1. **Check the debug endpoint** to see what's configured
2. **Check Vercel logs** for detailed error messages
3. **Verify environment variables** are set correctly
4. **Test email configuration** using the test endpoints

### Common Issues:

1. **SendGrid API Key Invalid**: Make sure the API key is correct and has the right permissions
2. **SMTP Authentication Failed**: Check your username/password and ensure 2FA is enabled
3. **Database Connection Failed**: Verify your DATABASE_URL is correct
4. **Environment Variables Not Set**: Make sure all required variables are added to Vercel

## Development vs Production

- **Development**: The app will log reset links to the console instead of sending emails
- **Production**: You must configure email services for the password reset to work

## Security Notes

- Never commit API keys or passwords to your code
- Use environment variables for all sensitive configuration
- Enable 2-factor authentication on email accounts used for SMTP
- Use app-specific passwords for SMTP authentication

## Support

If you continue to have issues:

1. Check the debug endpoint for specific error messages
2. Review Vercel deployment logs
3. Test each component individually (database, email)
4. Ensure all environment variables are properly set 