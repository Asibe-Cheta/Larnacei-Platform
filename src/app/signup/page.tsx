'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import React from 'react'; // Added missing import for React.useEffect

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: 'individual' | 'agent' | 'agency';
  agreeToTerms: boolean;
}

interface SignUpError {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  accountType?: string;
  agreeToTerms?: string;
  general?: string;
}

export default function SignUpPage() {
  console.log('📄 SignUpPage component loaded');
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<SignUpError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const validateForm = (): boolean => {
    console.log('🔍 validateForm called with data:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      accountType: formData.accountType,
      agreeToTerms: formData.agreeToTerms
    });
    const newErrors: SignUpError = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Worldwide phone number validation
      const cleanPhone = formData.phone.replace(/[^\d+]/g, "");
      const internationalPattern = /^\+[1-9]\d{1,14}$/;
      const localPatterns = [
        /^[1-9]\d{9,14}$/, // 10-15 digits starting with 1-9
        /^0[1-9]\d{8,13}$/, // Local format starting with 0
      ];

      if (!internationalPattern.test(cleanPhone) && !localPatterns.some(pattern => pattern.test(cleanPhone))) {
        newErrors.phone = 'Please enter a valid phone number (international format preferred)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account type';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 validateForm result:', { isValid, errors: newErrors });
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit called!');
    console.log('Form event:', e);
    e.preventDefault();

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    console.log('✅ Form validation passed');

    // Check network connectivity
    if (!navigator.onLine) {
      console.log('❌ No internet connection detected');
      setErrors({ general: 'No internet connection. Please check your network and try again.' });
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Sending registration request with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        accountType: formData.accountType,
        // Don't log password for security
      });

      const response = await fetch('/api/auth/register?t=' + Date.now(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          accountType: formData.accountType,
        }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        if (response.status === 503) {
          if (data.error && data.error.includes('Database')) {
            setErrors({ general: 'Database connection issue. Please try again in a few minutes or contact support.' });
          } else if (data.error && data.error.includes('configuration')) {
            setErrors({ general: 'System configuration issue. Please contact support.' });
          } else {
            setErrors({ general: 'Service temporarily unavailable. Please try again in a few minutes.' });
          }
        } else if (data.error) {
          setErrors({ general: data.error });
        } else if (data.details && Array.isArray(data.details)) {
          // Handle validation errors
          const fieldErrors: SignUpError = {};
          data.details.forEach((error: any) => {
            if (error.field) {
              fieldErrors[error.field as keyof SignUpError] = error.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
        return;
      }

      // Registration successful
      setVerificationSent(true);

      // Redirect to verification page with user's phone number
      if (data.verification && data.verification.phone) {
        const verificationUrl = `/verify?phone=${encodeURIComponent(data.verification.phone)}&token=${data.verification.emailToken}`;
        router.push(verificationUrl);
      } else {
        // Fallback to signin page
        router.push('/signin');
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });

      if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          setErrors({ general: 'Network error. Please check your internet connection and try again.' });
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          setErrors({ general: 'Unable to connect to server. Please check your internet connection.' });
        } else {
          setErrors({ general: `Registration failed: ${error.message}` });
        }
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof SignUpError]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Test API function
  const testAPI = async () => {
    try {
      console.log('🧪 Testing API...');
      const response = await fetch('/api/test?t=' + Date.now());
      const data = await response.json();
      console.log('🧪 API Test Result:', data);
      return true;
    } catch (error) {
      console.error('🧪 API Test Failed:', error);
      return false;
    }
  };

  // Test Database function
  const testDatabase = async () => {
    try {
      console.log('🧪 Testing Database...');
      const response = await fetch('/api/test-db?t=' + Date.now());
      const data = await response.json();
      console.log('🧪 Database Test Result:', data);
      return true;
    } catch (error) {
      console.error('🧪 Database Test Failed:', error);
      return false;
    }
  };

  // Test Environment function
  const testEnvironment = async () => {
    try {
      console.log('🧪 Testing Environment...');
      const response = await fetch('/api/debug/env?t=' + Date.now());
      const data = await response.json();
      console.log('🧪 Environment Test Result:', data);
      return true;
    } catch (error) {
      console.error('🧪 Environment Test Failed:', error);
      return false;
    }
  };

  // Test API on component load
  React.useEffect(() => {
    testAPI();
    testDatabase();
    testEnvironment();
  }, []);

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Registration Successful!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please check your email and phone for verification codes to complete your registration.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-2 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="First name"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-2 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="Last name"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="+1 234 567 8900 or +44 20 7946 0958"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your phone number in international format (e.g., +1 234 567 8900)
              </p>
            </div>

            {/* Account Type */}
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="mt-1">
                <select
                  id="accountType"
                  name="accountType"
                  required
                  value={formData.accountType}
                  onChange={(e) => handleInputChange('accountType', e.target.value as 'individual' | 'agent' | 'agency')}
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.accountType ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                >
                  <option value="individual">Individual</option>
                  <option value="agent">Real Estate Agent</option>
                  <option value="agency">Real Estate Agency</option>
                </select>
              </div>
              {errors.accountType && (
                <p className="mt-1 text-sm text-red-600">{errors.accountType}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              onClick={() => console.log('🔘 Submit button clicked!')}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 