'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Step1BasicInfo from '@/components/forms/property-listing/Step1BasicInfo';
import Step2Location from '@/components/forms/property-listing/Step2Location';
import Step3Details from '@/components/forms/property-listing/Step3Details';
import Step4Media from '@/components/forms/property-listing/Step4Media';
import Step5Legal from '@/components/forms/property-listing/Step5Legal';
import Step6Availability from '@/components/forms/property-listing/Step6Availability';
import { apiService } from '@/lib/api-service';
import { transformFormDataToApi, validateFormData } from '@/utils/form-transformers';
import { useRouter } from 'next/navigation';

type ListingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface PropertyListingData {
  // Step 1: Basic Info
  title: string;
  category: 'SHORT_STAYS' | 'LONG_TERM_RENTALS' | 'LANDED_PROPERTIES' | 'PROPERTY_SALES';
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'LAND' | 'COMMERCIAL' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';
  price: string;
  currency: 'NGN';
  description: string;

  // Step 2: Location
  address: string;
  city: string;
  state: string;
  lga: string;
  country: 'Nigeria';
  latitude?: number;
  longitude?: number;

  // Step 3: Details
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit: 'sqm' | 'sqft' | 'acres';
  amenities: string[];
  yearBuilt?: number;
  parkingSpaces?: number;
  condition?: string;

  // Step 4: Media
  images: File[];
  videos: File[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;

  // Step 5: Legal
  hasTitleDeed: boolean;
  titleDeedNumber?: string;
  hasSurveyPlan: boolean;
  surveyPlanNumber?: string;
  hasBuildingApproval: boolean;
  buildingApprovalNumber?: string;
  legalDocuments: File[];

  // Step 6: Availability
  isAvailable: boolean;
  availableFrom?: string;
  viewingPreferences: string[];
  contactPhone: string;
  contactEmail: string;
  additionalNotes?: string;
}

const steps = [
  { id: 1, title: 'Basic Info', description: 'Property title, type & price' },
  { id: 2, title: 'Location', description: 'Address & coordinates' },
  { id: 3, title: 'Details', description: 'Features & amenities' },
  { id: 4, title: 'Media', description: 'Photos & videos' },
  { id: 5, title: 'Legal', description: 'Documentation' },
  { id: 6, title: 'Availability', description: 'Viewing & contact' }
];

export default function ListPropertyPage() {
  const [currentStep, setCurrentStep] = useState<ListingStep>(1);
  const [formData, setFormData] = useState<PropertyListingData>({
    title: '',
    category: 'PROPERTY_SALES',
    type: 'HOUSE',
    price: '',
    currency: 'NGN',
    description: '',
    address: '',
    city: '',
    state: '',
    lga: '',
    country: 'Nigeria',
    areaUnit: 'sqm',
    amenities: [],
    condition: '',
    images: [],
    videos: [],
    virtualTourUrl: '',
    floorPlanUrl: '',
    hasTitleDeed: false,
    hasSurveyPlan: false,
    hasBuildingApproval: false,
    legalDocuments: [],
    isAvailable: true,
    viewingPreferences: [],
    contactPhone: '',
    contactEmail: ''
  });

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const updateFormData = (updates: Partial<PropertyListingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as ListingStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as ListingStep);
    }
  };

  /**
   * Handle property form submission
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setValidationErrors([]);
    setShowAuthPrompt(false);

    // Validate form data
    const { isValid, errors } = validateFormData(formData);
    if (!isValid) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // Check network connectivity
    if (!navigator.onLine) {
      setError('No internet connection. Please check your network and try again.');
      setIsSubmitting(false);
      return;
    }

    // Simulate image upload (replace with real upload logic)
    const imageUrls = formData.images.map((file: File) =>
      typeof file === 'string' ? file : URL.createObjectURL(file)
    );
    const videoUrls = formData.videos.map((file: File) =>
      typeof file === 'string' ? file : URL.createObjectURL(file)
    );

    // Transform data for API
    const apiData = transformFormDataToApi(formData, imageUrls, videoUrls);

    try {
      console.log('Submitting property data:', apiData);

      // Custom fetch to handle non-JSON responses
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(apiData),
      });

      const contentType = response.headers.get('content-type');
      let result: any = null;
      let rawText: string | null = null;

      // Log status and contentType for debugging
      console.log('API response status:', response.status, 'content-type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('API response JSON:', result);
      } else {
        rawText = await response.text();
        console.log('API response text:', rawText);
      }

      if (response.status === 401 || response.status === 403 || (rawText && /not authenticated|unauthorized/i.test(rawText))) {
        setShowAuthPrompt(true);
        setError('You need to be signed in to list a property. Please sign in or register to continue.');
        setTimeout(() => {
          router.push('/signin');
        }, 3500);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        const errorMessage = result?.message || result?.error || rawText || `Server error (${response.status})`;

        // Handle detailed validation errors
        if (response.status === 400 && result?.details) {
          const validationErrors = result.details.map((error: any) => {
            const field = error.path?.join('.') || 'unknown';
            return `${field}: ${error.message}`;
          });
          setValidationErrors(validationErrors);
          setError('Please fix the validation errors below');
        } else {
          setError(`Failed to list property: ${errorMessage}`);
        }

        setIsSubmitting(false);
        return;
      }

      if (result?.success) {
        setSuccess('Property listed successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(result?.message || rawText || 'Failed to list property');
      }
    } catch (err: any) {
      console.error('Property listing error:', err);

      // Handle specific error types
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.name === 'SyntaxError') {
        setError('Invalid response from server. Please try again.');
      } else {
        const msg = err.message || '';
        if (/not authenticated|unauthorized/i.test(msg)) {
          setShowAuthPrompt(true);
          setError('You need to be signed in to list a property. Please sign in or register to continue.');
          setTimeout(() => {
            router.push('/signin');
          }, 3500);
        } else {
          setError(`Failed to list property: ${msg}`);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2Location formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Details formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Media formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5Legal formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6Availability formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/Larnacei_coloured.png"
                  alt="Larnacei Global Limited Logo"
                  width={32}
                  height={32}
                  className="h-8"
                />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">List Your Property</h1>
            </div>
            <Link
              href="/dashboard"
              className="text-sm primary-text hover:text-red-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id
                  ? 'primary-bg border-red-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                  {currentStep > step.id ? (
                    <span className="material-icons text-sm">check</span>
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-red-600' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 rounded bg-[#7C0302]/10 border border-[#7C0302] text-[#7C0302]">
                <ul className="list-disc pl-5 text-sm">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded bg-[#7C0302]/10 border border-[#7C0302] text-[#7C0302] text-sm">
                {error}
                {showAuthPrompt && (
                  <div className="mt-4 flex gap-3">
                    <Link href="/signin" className="px-4 py-2 rounded bg-[#7C0302] text-white text-sm font-medium hover:bg-[#a00] transition-colors">Sign In</Link>
                    <Link href="/signup" className="px-4 py-2 rounded border border-[#7C0302] text-[#7C0302] text-sm font-medium hover:bg-[#7C0302]/10 transition-colors">Register</Link>
                  </div>
                )}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded bg-[#7C0302]/10 border border-[#7C0302] text-[#7C0302] text-sm font-semibold">
                {success}
              </div>
            )}
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep < 6 ? (
                <button
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="px-6 py-2 primary-bg text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 primary-bg text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Listing Property...' : 'List Property'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save Progress */}
        <div className="mt-4 text-center">
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Save as draft
          </button>
        </div>
      </div>
    </div>
  );
} 