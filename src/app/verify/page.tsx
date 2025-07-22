'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, Phone, Loader2 } from 'lucide-react';

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  emailToken?: string;
  phone?: string;
}

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>({
    emailVerified: false,
    phoneVerified: false
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check for email verification token in URL
    const token = searchParams.get('token');
    const phone = searchParams.get('phone');
    
    if (token) {
      verifyEmail(token);
    }
    
    if (phone) {
      setStatus(prev => ({ ...prev, phone }));
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(prev => ({ ...prev, emailVerified: true }));
        setSuccess('Email verified successfully!');
      } else {
        setError(data.error || 'Email verification failed');
      }
    } catch (error) {
      setError('Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || !status.phone) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: status.phone, otp })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(prev => ({ ...prev, phoneVerified: true }));
        setSuccess('Phone number verified successfully!');
      } else {
        setError(data.error || 'OTP verification failed');
      }
    } catch (error) {
      setError('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!status.phone) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sms/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: status.phone })
      });

      if (response.ok) {
        setSuccess('OTP sent successfully!');
      } else {
        setError('Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (status.emailVerified && status.phoneVerified) {
      router.push('/signin?verified=true');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please verify your email and phone number to complete registration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>
              Complete both verifications to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Verification */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Mail className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-500">Verify your email address</p>
              </div>
              {status.emailVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            {/* Phone Verification */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Phone className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Phone Verification</p>
                <p className="text-sm text-gray-500">
                  {status.phone ? `Verify ${status.phone}` : 'Enter your phone number'}
                </p>
              </div>
              {status.phoneVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            {/* OTP Input */}
            {status.phone && !status.phoneVerified && (
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={verifyOTP}
                    disabled={loading || !otp}
                    className="flex-1"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify OTP'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resendOTP}
                    disabled={loading}
                  >
                    Resend
                  </Button>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Continue Button */}
            {status.emailVerified && status.phoneVerified && (
              <Button
                onClick={handleContinue}
                className="w-full"
                size="lg"
              >
                Continue to Sign In
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 