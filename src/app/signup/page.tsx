'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { validateNigerianPhone, formatNigerianPhone, validateEmail, validatePassword } from '@/utils/validation';
import { signIn } from 'next-auth/react';

type UserType = 'individual' | 'agent' | 'agency';
type RegistrationStep = 'user-type' | 'basic-info' | 'verification';

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('user-type');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const userTypes = [
    {
      id: 'individual' as UserType,
      title: 'Individual',
      description: 'I want to buy, rent, or sell my own property',
      icon: 'person',
      features: ['List personal properties', 'Browse listings', 'Contact agents']
    },
    {
      id: 'agent' as UserType,
      title: 'Real Estate Agent',
      description: 'I work as a licensed real estate agent',
      icon: 'business',
      features: ['List client properties', 'Manage listings', 'Professional tools']
    },
    {
      id: 'agency' as UserType,
      title: 'Agency/Company',
      description: 'I represent a real estate company',
      icon: 'business_center',
      features: ['Multiple agent accounts', 'Company branding', 'Advanced analytics']
    }
  ];

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentStep('basic-info');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validateNigerianPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Nigerian phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Format phone number to international format
    const formattedPhone = formatNigerianPhone(formData.phone);

    // Map userType to accountType
    let accountType: 'INDIVIDUAL' | 'AGENT' | 'AGENCY' = 'INDIVIDUAL';
    if (userType === 'agent') accountType = 'AGENT';
    if (userType === 'agency') accountType = 'AGENCY';

    // Prepare API payload
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formattedPhone,
      password: formData.password,
      accountType,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ api: data.message || 'Registration failed' });
        setIsLoading(false);
        return;
      }
      // Auto sign-in after registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (signInRes?.ok) {
        window.location.href = '/dashboard';
      } else {
        setCurrentStep('verification');
      }
    } catch (err: any) {
      setErrors({ api: err.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserTypeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Choose your account type
      </h3>
      {userTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => handleUserTypeSelect(type.id)}
          className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-left"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 primary-bg rounded-lg flex items-center justify-center">
                <span className="material-icons text-white text-xl">{type.icon}</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{type.title}</h4>
              <p className="text-gray-600 mt-1">{type.description}</p>
              <ul className="mt-3 space-y-1">
                {type.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-500 flex items-center">
                    <span className="material-icons text-green-500 text-sm mr-2">check</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.api && (
        <div className="mb-2 p-3 rounded bg-[#7C0302]/10 border border-[#7C0302] text-[#7C0302] text-sm">
          {errors.api}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.firstName}
            onChange={handleInputChange}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.lastName}
            onChange={handleInputChange}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone number (Nigeria)
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">+234</span>
          </div>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="801 234 5678"
            className={`block w-full pl-12 border rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        {errors.phone ? (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            Format: 801 234 5678 (we'll add +234 automatically)
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password ? (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            required
            className={`h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1 ${
              errors.agreeToTerms ? 'border-red-500' : ''
            }`}
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link href="/terms" className="primary-text hover:text-red-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="primary-text hover:text-red-700">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
        )}

        <div className="flex items-start">
          <input
            id="agreeToMarketing"
            name="agreeToMarketing"
            type="checkbox"
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
            checked={formData.agreeToMarketing}
            onChange={handleInputChange}
          />
          <label htmlFor="agreeToMarketing" className="ml-2 block text-sm text-gray-900">
            I agree to receive marketing communications from Larnacei
          </label>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setCurrentStep('user-type')}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white primary-bg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );

  const renderVerification = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <span className="material-icons text-green-600 text-2xl">email</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
      <p className="text-gray-600">
        We've sent a verification link to <strong>{formData.email}</strong>
      </p>
      <p className="text-sm text-gray-500">
        Click the link in your email to verify your account and complete registration.
      </p>
      <div className="pt-4">
        <Link
          href="/signin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white primary-bg hover:bg-red-700 transition-colors"
        >
          Continue to sign in
        </Link>
      </div>
    </div>
  );

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
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 heading-font">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium primary-text hover:text-red-700 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {currentStep === 'user-type' && renderUserTypeSelection()}
          {currentStep === 'basic-info' && renderBasicInfo()}
          {currentStep === 'verification' && renderVerification()}
        </div>
      </div>
    </div>
  );
} 