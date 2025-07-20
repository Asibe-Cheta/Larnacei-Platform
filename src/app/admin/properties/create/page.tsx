'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  MapPin,
  Home,
  X,
  Save
} from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  priceType: string;
  location: string;
  address: string;
  state: string;
  lga: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  area?: number;
  areaUnit: string;
  furnishingStatus: string;
  condition: string;
  availableFrom: string;
  images: File[];
  legalDocuments: File[];
  amenities: string[];
  features: string[];
}

const categories = [
  { value: 'SHORT_STAY', label: 'Short Stay', description: 'Vacation rentals, holiday homes' },
  { value: 'LONG_TERM_RENTAL', label: 'Long-term Rental', description: 'Residential leases' },
  { value: 'PROPERTY_SALE', label: 'Property Sale', description: 'Houses for purchase' },
  { value: 'LANDED_PROPERTY', label: 'Landed Property', description: 'Land for sale' }
];

const propertyTypes = {
  SHORT_STAY: [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' }
  ],
  LONG_TERM_RENTAL: [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'COMMERCIAL', label: 'Commercial' }
  ],
  PROPERTY_SALE: [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'SHOP', label: 'Shop' },
    { value: 'WAREHOUSE', label: 'Warehouse' }
  ],
  LANDED_PROPERTY: [
    { value: 'LAND', label: 'Land' }
  ]
};

const nigerianStates = [
  'Abuja', 'Lagos', 'Kano', 'Kaduna', 'Katsina', 'Oyo', 'Rivers', 'Jigawa', 'Zamfara',
  'Kebbi', 'Sokoto', 'Gombe', 'Yobe', 'Borno', 'Taraba', 'Adamawa', 'Niger', 'Kogi',
  'Kwara', 'Nasarawa', 'Plateau', 'Bauchi', 'Anambra', 'Enugu', 'Imo', 'Abia',
  'Ebonyi', 'Cross River', 'Akwa Ibom', 'Bayelsa', 'Delta', 'Edo', 'Ondo', 'Ekiti',
  'Osun', 'Ogun', 'Katsina', 'Kano', 'Kaduna', 'Kebbi', 'Sokoto', 'Zamfara',
  'Katsina', 'Kano', 'Kaduna', 'Kebbi', 'Sokoto', 'Zamfara', 'Katsina', 'Kano',
  'Kaduna', 'Kebbi', 'Sokoto', 'Zamfara', 'Katsina', 'Kano', 'Kaduna', 'Kebbi',
  'Sokoto', 'Zamfara', 'Katsina', 'Kano', 'Kaduna', 'Kebbi', 'Sokoto', 'Zamfara'
];

const amenities = [
  'WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Washing Machine', 'Dryer',
  'Parking', 'Gym', 'Pool', 'Garden', 'Balcony', 'Terrace', 'Elevator', 'Security',
  'CCTV', 'Intercom', 'Pet Friendly', 'Furnished', 'Unfurnished', 'Partially Furnished'
];

const features = [
  'Modern Design', 'Spacious', 'Quiet Location', 'City Center', 'Near Transport',
  'Near Schools', 'Near Hospitals', 'Near Shopping', 'Near Restaurants', 'Near Parks',
  'Gated Community', '24/7 Security', 'Backup Power', 'Water Supply', 'Internet Ready'
];

export default function AdminCreatePropertyPage() {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    category: '',
    type: '',
    price: 0,
    priceType: 'PER_NIGHT',
    location: '',
    address: '',
    state: '',
    lga: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    area: 0,
    areaUnit: 'SQ_M',
    furnishingStatus: 'UNFURNISHED',
    condition: 'NEW',
    availableFrom: '',
    images: [],
    legalDocuments: [],
    amenities: [],
    features: []
  });

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue ? parseInt(numericValue, 10) : 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateFormData({ images: [...formData.images, ...files] });
  };

  const removeImage = (index: number) => {
    updateFormData({ images: formData.images.filter((_, i) => i !== index) });
  };

  const toggleAmenity = (amenity: string) => {
    const updatedAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    updateFormData({ amenities: updatedAmenities });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for form submission
    console.log('Form data:', formData);
  };

  const toggleFeature = (feature: string) => {
    const updatedFeatures = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    updateFormData({ features: updatedFeatures });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateFormData({ legalDocuments: [...formData.legalDocuments, ...files] });
  };

  const removeDocument = (index: number) => {
    updateFormData({ legalDocuments: formData.legalDocuments.filter((_, i) => i !== index) });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/properties"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Properties</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Property</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter property title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateFormData({ type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    {propertyTypes[formData.category as keyof typeof propertyTypes]?.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => updateFormData({ price: formatPrice(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Type
                </label>
                <select
                  value={formData.priceType}
                  onChange={(e) => updateFormData({ priceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PER_NIGHT">Per Night</option>
                  <option value="PER_MONTH">Per Month</option>
                  <option value="PER_YEAR">Per Year</option>
                  <option value="TOTAL">Total Price</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the property..."
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => updateFormData({ state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select State</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LGA *
                </label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => updateFormData({ lga: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter LGA"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  value={formData.bedrooms || ''}
                  onChange={(e) => updateFormData({ bedrooms: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  value={formData.bathrooms || ''}
                  onChange={(e) => updateFormData({ bathrooms: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  value={formData.parkingSpaces || ''}
                  onChange={(e) => updateFormData({ parkingSpaces: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <input
                  type="number"
                  value={formData.area || ''}
                  onChange={(e) => updateFormData({ area: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area Unit
                </label>
                <select
                  value={formData.areaUnit}
                  onChange={(e) => updateFormData({ areaUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SQ_M">Square Meters</option>
                  <option value="SQ_FT">Square Feet</option>
                  <option value="ACRES">Acres</option>
                  <option value="HECTARES">Hectares</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => updateFormData({ availableFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing Status
                </label>
                <select
                  value={formData.furnishingStatus}
                  onChange={(e) => updateFormData({ furnishingStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="PARTIALLY_FURNISHED">Partially Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => updateFormData({ condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NEW">New</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Property Images
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Click to upload images or drag and drop</p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities & Features */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Amenities & Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature) => (
                    <label key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Legal Documents</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleDocumentUpload}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Upload legal documents</p>
                <p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB each</p>
              </label>
            </div>

            {formData.legalDocuments.length > 0 && (
              <div className="mt-6 space-y-2">
                {formData.legalDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/properties"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Create Property</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 