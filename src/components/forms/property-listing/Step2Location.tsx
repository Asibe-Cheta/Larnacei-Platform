'use client';

import { lgasByState } from '@/utils/nigeria-lga';

interface PropertyListingData {
  address: string;
  city: string;
  state: string;
  lga: string;
  country: 'Nigeria';
  latitude?: number;
  longitude?: number;
}

interface Step2LocationProps {
  formData: PropertyListingData;
  updateFormData: (updates: Partial<PropertyListingData>) => void;
}

const nigerianStates = Object.keys(lgasByState);

export default function Step2Location({ formData, updateFormData }: Step2LocationProps) {
  const handleInputChange = (field: keyof PropertyListingData, value: any) => {
    updateFormData({ [field]: value });
    
    // Reset LGA when state changes
    if (field === 'state') {
      updateFormData({ lga: '' });
    }
  };

  const getLGAsForState = (state: string) => {
    return lgasByState[state] || [];
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Address</h2>
        <p className="text-gray-600">Help potential buyers/renters find your property easily.</p>
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
          Country *
        </label>
        <input
          type="text"
          id="country"
          value={formData.country}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Currently only supporting properties in Nigeria
        </p>
      </div>

      {/* State */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
          State *
        </label>
        <select
          id="state"
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        >
          <option value="">Select a state</option>
          {nigerianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* LGA */}
      <div>
        <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-2">
          Local Government Area (LGA) *
        </label>
        <select
          id="lga"
          value={formData.lga}
          onChange={(e) => handleInputChange('lga', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
          disabled={!formData.state}
        >
          <option value="">Select an LGA</option>
          {getLGAsForState(formData.state).map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>
        {!formData.state && (
          <p className="mt-1 text-sm text-gray-500">Please select a state first</p>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          City/Town *
        </label>
        <input
          type="text"
          id="city"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="e.g., Lagos, Abuja, Port Harcourt"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Street Address *
        </label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
          placeholder="e.g., 123 Victoria Island, Lekki Phase 1, Lagos"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Provide the full street address including landmarks if possible
        </p>
      </div>

      {/* Coordinates (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GPS Coordinates (Optional)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Adding coordinates helps with map display and location accuracy
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-xs font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              id="latitude"
              value={formData.latitude || ''}
              onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="6.5244"
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-xs font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              id="longitude"
              value={formData.longitude || ''}
              onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="3.3792"
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          You can find coordinates using Google Maps or other mapping services
        </p>
      </div>

      {/* Location Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Location Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be as specific as possible with the address</li>
          <li>• Include nearby landmarks for easier identification</li>
          <li>• GPS coordinates improve search accuracy</li>
          <li>• Consider privacy - don't include exact house numbers if concerned</li>
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Location Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Country:</strong> {formData.country}</p>
          <p><strong>State:</strong> {formData.state || 'Not selected'}</p>
          <p><strong>LGA:</strong> {formData.lga || 'Not selected'}</p>
          <p><strong>City:</strong> {formData.city || 'Not entered'}</p>
          <p><strong>Address:</strong> {formData.address || 'Not entered'}</p>
          {formData.latitude && formData.longitude && (
            <p><strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}</p>
          )}
        </div>
      </div>
    </div>
  );
} 