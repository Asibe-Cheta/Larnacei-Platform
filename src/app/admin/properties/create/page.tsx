'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  MapPin, 
  Home, 
  Star,
  Building,
  TrendingUp,
  X
} from 'lucide-react';

interface AdminPropertyFormData {
  title: string;
  description: string;
  category: 'SHORT_STAY' | 'LONG_TERM_RENTAL' | 'PROPERTY_SALE' | 'LANDED_PROPERTY';
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'LAND' | 'COMMERCIAL' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';
  price: string;
  currency: 'NGN';
  city: string;
  state: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeInSqm?: number;
  isFeatured: boolean;
  isActive: boolean;
  isApproved: boolean;
  isVerified: boolean;
  images: File[];
  amenities: string[];
  contactPhone: string;
  contactEmail: string;
  contactName: string;
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

const propertyStatusOptions = [
  { value: 'featured', label: 'Featured', description: 'Highlighted on homepage', icon: Star },
  { value: 'regular', label: 'Regular', description: 'Standard property listing', icon: Home }
];

const nigerianStates = [
  'Abuja', 'Lagos', 'Kano', 'Kaduna', 'Katsina', 'Oyo', 'Rivers', 'Jigawa', 'Zamfara',
  'Kebbi', 'Sokoto', 'Gombe', 'Yobe', 'Borno', 'Taraba', 'Adamawa', 'Niger', 'Kogi',
  'Kwara', 'Nasarawa', 'Plateau', 'Bauchi', 'Anambra', 'Enugu', 'Imo', 'Abia', 
  'Ebonyi', 'Cross River', 'Akwa Ibom', 'Bayelsa', 'Delta', 'Edo', 'Ondo', 'Ekiti', 
  'Ogun', 'Osun'
];

const amenities = [
  'Air Conditioning', 'Balcony', 'Garden', 'Parking', 'Security', 'Swimming Pool',
  'Gym', 'WiFi', 'Kitchen', 'Laundry', 'Furnished', 'Pet Friendly', 'Elevator',
  'Doorman', 'Storage', 'Terrace', 'Fireplace', 'Central Heating', 'Dishwasher',
  'Microwave', 'Refrigerator', 'Washing Machine', 'Dryer', 'Cable TV', 'Internet'
];

export default function AdminCreatePropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AdminPropertyFormData>({
    title: '',
    description: '',
    category: 'PROPERTY_SALE',
    type: 'APARTMENT',
    price: '',
    currency: 'NGN',
    city: '',
    state: '',
    address: '',
    bedrooms: undefined,
    bathrooms: undefined,
    sizeInSqm: undefined,
    isFeatured: true,
    isActive: true,
    isApproved: true,
    isVerified: true,
    images: [],
    amenities: [],
    contactPhone: '',
    contactEmail: '',
    contactName: ''
  });

  const updateFormData = (updates: Partial<AdminPropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Reset type when category changes
    if ('category' in updates) {
      const availableTypes = propertyTypes[updates.category as keyof typeof propertyTypes];
      if (availableTypes.length > 0) {
        setFormData(prev => ({ ...prev, type: availableTypes[0].value as any }));
      }
    }
  };

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue) {
      return new Intl.NumberFormat('en-NG').format(parseInt(numericValue));
    }
    return '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateFormData({ images: [...formData.images, ...files] });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    updateFormData({ amenities: newAmenities });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach((file, index) => {
            submitData.append(`images`, file);
          });
        } else if (key === 'amenities') {
          submitData.append('amenities', JSON.stringify(value));
        } else {
          submitData.append(key, String(value));
        }
      });

      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        router.push('/admin/properties');
      } else {
        throw new Error('Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/properties"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Properties
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Admin Property</h1>
            <p className="text-gray-600">Create a new property that can be featured on the homepage</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="e.g., Beautiful 3-Bedroom Villa in Lekki"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Category and Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData({ category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateFormData({ type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                {propertyTypes[formData.category].map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (NGN) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₦</span>
                </div>
                <input
                  type="text"
                  id="price"
                  value={formData.price}
                  onChange={(e) => updateFormData({ price: formatPrice(e.target.value) })}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            {/* Featured Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Status
              </label>
              <select
                value={formData.isFeatured ? 'featured' : 'regular'}
                onChange={(e) => updateFormData({ isFeatured: e.target.value === 'featured' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                {propertyStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={4}
              placeholder="Describe the property in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                value={formData.state}
                onChange={(e) => updateFormData({ state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
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
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder="e.g., Lagos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData({ address: e.target.value })}
                placeholder="e.g., 123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Property Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                value={formData.bedrooms || ''}
                onChange={(e) => updateFormData({ bedrooms: e.target.value ? parseInt(e.target.value) : undefined })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                value={formData.bathrooms || ''}
                onChange={(e) => updateFormData({ bathrooms: e.target.value ? parseInt(e.target.value) : undefined })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="sizeInSqm" className="block text-sm font-medium text-gray-700 mb-2">
                Size (sqm)
              </label>
              <input
                type="number"
                id="sizeInSqm"
                value={formData.sizeInSqm || ''}
                onChange={(e) => updateFormData({ sizeInSqm: e.target.value ? parseInt(e.target.value) : undefined })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                id="contactName"
                value={formData.contactName}
                onChange={(e) => updateFormData({ contactName: e.target.value })}
                placeholder="Contact person name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                placeholder="+234 801 234 5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenities.map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Property Images
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload multiple images. First image will be the primary image.
              </p>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => updateFormData({ isActive: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isApproved}
                onChange={(e) => updateFormData({ isApproved: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Approved</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => updateFormData({ isVerified: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Verified</span>
            </label>
          </div>
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
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
} 