# Registration Issue Diagnosis Guide

## Problem
The registration API is returning a 503 Service Unavailable error with the message "No internet connection".

## Root Cause Analysis
Based on the console logs and code analysis, the issue is likely one of the following:

1. **Database Connection Issue**: Prisma can't connect to the database
2. **Missing Environment Variables**: Required configuration for email/SMS services
3. **Email/SMS Service Errors**: The registration process tries to send verification emails and SMS

## Fixes Applied

### 1. Enhanced Registration API (`src/app/api/auth/register/route.ts`)
- Added explicit database connection test
- Made email and SMS sending non-blocking
- Added better error handling and logging
- Added proper database disconnection

### 2. Debug Endpoints Created
- `/api/test-db` - Tests database connectivity
- `/api/debug/env` - Checks environment variables (development only)
- `/api/auth/register-debug` - Debug version of registration

### 3. Enhanced Signup Page (`src/app/signup/page.tsx`)
- Added better error handling for 503 errors
- Added diagnostic tests for API, database, and environment
- Improved user feedback

## Testing Steps

### Step 1: Check Environment Variables
Visit: `http://localhost:3000/api/debug/env` (development only)
This will show which environment variables are missing.

### Step 2: Test Database Connection
Visit: `http://localhost:3000/api/test-db`
This will test if the database is accessible.

### Step 3: Test Basic API
Visit: `http://localhost:3000/api/test`
This should always work.

### Step 4: Test Debug Registration
Try the debug registration endpoint: `POST /api/auth/register-debug`

## Required Environment Variables

### Database
```
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
```

### Email (Mailgun or SMTP)
```
# Option 1: Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com

# Option 2: SMTP (fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### SMS (Twilio)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Authentication
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Quick Fix for Development

If you're in development mode and don't have email/SMS configured:

1. The email service will log verification links to the console
2. The SMS service will log OTP codes to the console
3. Registration should still work without these services

## Next Steps

1. Check the console logs for the diagnostic tests
2. Verify environment variables are set correctly
3. Test the registration process again
4. If database connection fails, check your database configuration

## Console Commands

```bash
# Start the development server
npm run dev

# Check if database is accessible
curl http://localhost:3000/api/test-db

# Check environment variables
curl http://localhost:3000/api/debug/env
``` 