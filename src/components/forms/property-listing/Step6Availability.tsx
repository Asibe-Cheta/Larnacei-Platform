'use client';

import { validateNigerianPhone } from '@/utils/validation';

interface PropertyListingData {
  isAvailable: boolean;
  availableFrom?: string;
  viewingPreferences: string[];
  contactPhone: string;
  contactEmail: string;
  additionalNotes?: string;
}

interface Step6AvailabilityProps {
  formData: PropertyListingData;
  updateFormData: (updates: Partial<PropertyListingData>) => void;
}

const viewingOptions = [
  { value: 'WEEKDAYS', label: 'Weekdays (Monday - Friday)' },
  { value: 'WEEKENDS', label: 'Weekends (Saturday - Sunday)' },
  { value: 'EVENINGS', label: 'Evenings (After 6 PM)' },
  { value: 'BY_APPOINTMENT', label: 'By Appointment Only' },
  { value: 'FLEXIBLE', label: 'Flexible Schedule' }
];

export default function Step6Availability({ formData, updateFormData }: Step6AvailabilityProps) {
  const handleInputChange = (field: keyof PropertyListingData, value: any) => {
    updateFormData({ [field]: value });
  };

  const toggleViewingPreference = (preference: string) => {
    const currentPreferences = formData.viewingPreferences;
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter(p => p !== preference)
      : [...currentPreferences, preference];
    
    updateFormData({ viewingPreferences: updatedPreferences });
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types - support worldwide numbers
    let formatted = value.replace(/[^\d+]/g, '');
    
    // If it already has +, keep it
    if (formatted.startsWith('+')) {
      updateFormData({ contactPhone: formatted });
      return;
    }
    
    // For local formats, just store as is
    updateFormData({ contactPhone: formatted });
  };

  const isPhoneValid = formData.contactPhone ? (() => {
    const cleanPhone = formData.contactPhone.replace(/[^\d+]/g, "");
    const internationalPattern = /^\+[1-9]\d{1,14}$/;
    const localPatterns = [
      /^[1-9]\d{9,14}$/, // 10-15 digits starting with 1-9
      /^0[1-9]\d{8,13}$/, // Local format starting with 0
    ];
    return internationalPattern.test(cleanPhone) || localPatterns.some(pattern => pattern.test(cleanPhone));
  })() : true;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Availability & Contact</h2>
        <p className="text-gray-600">Set your availability and provide contact information for potential buyers/renters.</p>
      </div>

      {/* Availability Status */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="material-icons text-red-600">schedule</span>
          <h3 className="text-lg font-medium text-gray-900">Availability Status</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
              This property is currently available
            </label>
          </div>

          {formData.isAvailable && (
            <div>
              <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-2">
                Available From (Optional)
              </label>
              <input
                type="date"
                id="availableFrom"
                value={formData.availableFrom || ''}
                onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty if available immediately
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Viewing Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Viewing Preferences *
        </label>
        <div className="space-y-3">
          {viewingOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.viewingPreferences.includes(option.value)}
                onChange={() => toggleViewingPreference(option.value)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        {formData.viewingPreferences.length === 0 && (
          <p className="mt-2 text-sm text-red-600">Please select at least one viewing preference</p>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        
        {/* Phone Number */}
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+1 234 567 8900 or +44 20 7946 0958"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 ${
              formData.contactPhone && !isPhoneValid
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            required
          />
          {formData.contactPhone && !isPhoneValid && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid phone number (international format preferred)
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            This will be visible to potential buyers/renters
          </p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="contactEmail"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            This will be visible to potential buyers/renters
          </p>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          id="additionalNotes"
          value={formData.additionalNotes || ''}
          onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
          rows={4}
          placeholder="Any additional information about viewing arrangements, special requirements, or other notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          This information will be shared with potential buyers/renters
        </p>
      </div>

      {/* Contact Preferences */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Contact Preferences</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Phone calls are preferred for urgent inquiries</li>
          <li>• Email is best for detailed questions</li>
          <li>• Respond within 24 hours to maintain good ratings</li>
          <li>• Be professional and courteous in all communications</li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Privacy Notice</h3>
        <p className="text-sm text-gray-600">
          Your contact information will be shared with potential buyers/renters who express interest in your property. 
          We recommend using a dedicated phone number or email for property inquiries to maintain privacy.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Availability & Contact Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Status:</strong> {formData.isAvailable ? 'Available' : 'Not Available'}</p>
          {formData.availableFrom && (
            <p><strong>Available From:</strong> {new Date(formData.availableFrom).toLocaleDateString()}</p>
          )}
          <p><strong>Viewing Preferences:</strong> {formData.viewingPreferences.length} selected</p>
          <p><strong>Phone:</strong> {formData.contactPhone || 'Not provided'}</p>
          <p><strong>Email:</strong> {formData.contactEmail || 'Not provided'}</p>
          <p><strong>Additional Notes:</strong> {formData.additionalNotes ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Final Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">Final Checklist</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ All required fields completed</li>
          <li>✓ Contact information provided</li>
          <li>✓ Viewing preferences selected</li>
          <li>✓ Property details accurate</li>
          <li>✓ Legal documents uploaded (if applicable)</li>
        </ul>
      </div>
    </div>
  );
} 