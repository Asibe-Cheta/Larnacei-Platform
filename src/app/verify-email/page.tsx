'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now sign in to your account.');
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Email verification failed. Please try again.');
      }
    } catch {
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/Larnacei_coloured.png"
              alt="Larnacei Global Limited Logo"
              width={48}
              height={48}
              className="h-12"
            />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            {verificationStatus === 'loading' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <span className="material-icons text-blue-600 text-2xl animate-spin">hourglass_empty</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Verifying your email...</h3>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <span className="material-icons text-green-600 text-2xl">check</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Email Verified!</h3>
                <p className="text-gray-600">{message}</p>
                <div className="pt-4">
                  <Link
                    href="/signin"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white primary-bg hover:bg-red-700 transition-colors"
                  >
                    Continue to Sign In
                  </Link>
                </div>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <span className="material-icons text-red-600 text-2xl">error</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Verification Failed</h3>
                <p className="text-gray-600">{message}</p>
                <div className="pt-4 space-y-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Try Registration Again
                  </Link>
                  <div>
                    <Link
                      href="/signin"
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 