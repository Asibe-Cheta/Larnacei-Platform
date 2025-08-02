'use client';

import { useState } from 'react';

interface PropertyListingData {
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit: 'sqm' | 'sqft' | 'acres';
  amenities: string[];
  yearBuilt?: number;
  parkingSpaces?: number;
  condition?: string;
}

interface Step3DetailsProps {
  formData: PropertyListingData;
  updateFormData: (updates: Partial<PropertyListingData>) => void;
}

const commonAmenities = [
  // Basic Amenities
  { category: 'Basic', items: ['Electricity', 'Water Supply', 'Security', 'Parking', 'Garden'] },
  // Interior Amenities
  { category: 'Interior', items: ['Air Conditioning', 'Furnished', 'Kitchen', 'Dining Area', 'Living Room', 'Study Room', 'Walk-in Closet'] },
  // Exterior Amenities
  { category: 'Exterior', items: ['Balcony', 'Terrace', 'Swimming Pool', 'Gym', 'Playground', 'BBQ Area', 'Garden'] },
  // Utilities
  { category: 'Utilities', items: ['Internet', 'Cable TV', 'Generator', 'Solar Power', 'Water Heater', 'Washing Machine'] },
  // Security
  { category: 'Security', items: ['CCTV', 'Security Guard', 'Gated Community', 'Intercom', 'Fire Alarm', 'Burglar Alarm'] },
  // Additional
  { category: 'Additional', items: ['Pet Friendly', 'Wheelchair Accessible', 'Elevator', 'Storage Room', 'Servant Quarters', 'Guest House'] }
];

export default function Step3Details({ formData, updateFormData }: Step3DetailsProps) {
  const [customAmenity, setCustomAmenity] = useState('');

  const handleInputChange = (field: keyof PropertyListingData, value: any) => {
    console.log(`Updating ${field} to:`, value);
    updateFormData({ [field]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities;
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];

    updateFormData({ amenities: updatedAmenities });
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      updateFormData({ amenities: [...formData.amenities, customAmenity.trim()] });
      setCustomAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    updateFormData({ amenities: formData.amenities.filter(a => a !== amenity) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Details & Features</h2>
        <p className="text-gray-600">Describe the key features and specifications of your property.</p>
      </div>

      {/* Basic Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bedrooms */}
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <select
            id="bedrooms"
            value={formData.bedrooms || ''}
            onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
            <option value="11">11+</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <select
            id="bathrooms"
            value={formData.bathrooms || ''}
            onChange={(e) => handleInputChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select</option>
            {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
            <option value="9">9+</option>
          </select>
        </div>

        {/* Parking Spaces */}
        <div>
          <label htmlFor="parkingSpaces" className="block text-sm font-medium text-gray-700 mb-2">
            Parking Spaces
          </label>
          <select
            id="parkingSpaces"
            value={formData.parkingSpaces || ''}
            onChange={(e) => handleInputChange('parkingSpaces', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select</option>
            <option value="0">None</option>
            {Array.from({ length: 6 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
            <option value="7">7+</option>
          </select>
        </div>
      </div>

      {/* Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
            Area Size
          </label>
          <input
            type="number"
            id="area"
            value={formData.area || ''}
            onChange={(e) => handleInputChange('area', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="e.g., 150"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label htmlFor="areaUnit" className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            id="areaUnit"
            value={formData.areaUnit}
            onChange={(e) => handleInputChange('areaUnit', e.target.value as 'sqm' | 'sqft' | 'acres')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="sqm">Square Meters (sqm)</option>
            <option value="sqft">Square Feet (sqft)</option>
            <option value="acres">Acres</option>
          </select>
        </div>
      </div>

      {/* Year Built */}
      <div>
        <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-2">
          Year Built (Optional)
        </label>
        <input
          type="number"
          id="yearBuilt"
          value={formData.yearBuilt || ''}
          onChange={(e) => handleInputChange('yearBuilt', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="e.g., 2020"
          min="1900"
          max={new Date().getFullYear()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Property Condition */}
      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
          Property Condition *
        </label>
        <select
          id="condition"
          value={formData.condition || ''}
          onChange={(e) => handleInputChange('condition', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          required
        >
          <option value="">Select Condition</option>
          <option value="NEW">New</option>
          <option value="OLD">Old</option>
          <option value="RENOVATED">Renovated</option>
          <option value="UNDER_CONSTRUCTION">Under Construction</option>
          <option value="NEEDS_RENOVATION">Needs Renovation</option>
        </select>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Amenities & Features
        </label>

        {/* Selected Amenities */}
        {formData.amenities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Amenities:</h4>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Common Amenities */}
        <div className="space-y-6">
          {commonAmenities.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{category.category}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {category.items.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Amenity */}
        <div className="mt-6">
          <label htmlFor="customAmenity" className="block text-sm font-medium text-gray-700 mb-2">
            Add Custom Amenity
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="customAmenity"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              placeholder="Enter custom amenity"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
            />
            <button
              type="button"
              onClick={addCustomAmenity}
              className="px-4 py-2 primary-bg text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">Property Details Tips</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Be accurate with room counts and measurements</li>
          <li>• Include all relevant amenities to attract more interest</li>
          <li>• Year built information helps with property valuation</li>
          <li>• Parking spaces are important for many buyers/renters</li>
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Details Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Bedrooms:</strong> {formData.bedrooms || 'Not specified'}</p>
          <p><strong>Bathrooms:</strong> {formData.bathrooms || 'Not specified'}</p>
          <p><strong>Parking:</strong> {formData.parkingSpaces || 'Not specified'} spaces</p>
          <p><strong>Area:</strong> {formData.area ? `${formData.area} ${formData.areaUnit}` : 'Not specified'}</p>
          <p><strong>Year Built:</strong> {formData.yearBuilt || 'Not specified'}</p>
          <p><strong>Amenities:</strong> {formData.amenities.length} selected</p>
        </div>
      </div>
    </div>
  );
} 