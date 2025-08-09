'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminPropertyData {
  title: string;
  category: 'SHORT_STAY' | 'LONG_TERM_RENTAL' | 'LANDED_PROPERTY' | 'PROPERTY_SALE';
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'LAND' | 'COMMERCIAL';
  price: string;
  description: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit: 'sqm' | 'sqft';
  amenities: string[];
  images: File[];
  videos: File[];
  isFeatured: boolean;
  contactPhone: string;
  contactEmail: string;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<AdminPropertyData>({
    title: '',
    category: 'PROPERTY_SALE',
    type: 'HOUSE',
    price: '',
    description: '',
    address: '',
    city: '',
    state: '',
    lga: '',
    areaUnit: 'sqm',
    amenities: [],
    images: [],
    videos: [],
    isFeatured: false,
    contactPhone: '',
    contactEmail: '',
  });

  const updateFormData = (updates: Partial<AdminPropertyData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateFormData({ [name]: checked });
    } else if (type === 'number') {
      updateFormData({ [name]: value ? parseFloat(value) : undefined });
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'images' | 'videos') => {
    const files = Array.from(e.target.files || []);
    const maxFileSize = fileType === 'images' ? 4.5 * 1024 * 1024 : 30 * 1024 * 1024; // 4.5MB for images, 30MB for videos
    
    const validFiles = files.filter(file => {
      if (fileType === 'images' && !file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: `${file.name} is not a valid image file.` });
        return false;
      }
      if (fileType === 'videos' && !file.type.startsWith('video/')) {
        setMessage({ type: 'error', text: `${file.name} is not a valid video file.` });
        return false;
      }
      if (file.size > maxFileSize) {
        setMessage({
          type: 'error',
          text: `${file.name} is too large. Maximum size is ${fileType === 'images' ? '4.5MB' : '30MB'}.` 
        });
        return false;
      }
      return true;
    });

    updateFormData({ [fileType]: [...formData[fileType], ...validFiles] });
  };

  const removeFile = (index: number, fileType: 'images' | 'videos') => {
    const files = formData[fileType].filter((_, i) => i !== index);
    updateFormData({ [fileType]: files });
  };

  const handleAmenityToggle = (amenity: string) => {
    const current = formData.amenities;
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    updateFormData({ amenities: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Basic validation
      if (!formData.title || formData.title.length < 10) {
        throw new Error('Property title must be at least 10 characters');
      }
      if (!formData.description || formData.description.length < 50) {
        throw new Error('Property description must be at least 50 characters');
      }
      if (!formData.price || parseFloat(formData.price.replace(/,/g, '')) < 100000) {
        throw new Error('Property price must be at least ₦100,000');
      }
      if (!formData.address || formData.address.length < 10) {
        throw new Error('Address must be at least 10 characters');
      }
      if (!formData.city || !formData.state || !formData.lga) {
        throw new Error('City, state, and LGA are required');
      }
      if (formData.amenities.length === 0) {
        throw new Error('At least one amenity is required');
      }
      if (formData.images.length === 0) {
        throw new Error('At least one property image is required');
      }
      if (!formData.contactPhone || !formData.contactEmail) {
        throw new Error('Contact phone and email are required');
      }

      // Upload images in parallel for better UX - now possible with efficient binary uploads!
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        setUploadProgress(`Uploading ${formData.images.length} images in parallel...`);
        console.log('Uploading images in parallel...', formData.images.length, 'files');
        
        // Create upload promises for all images
        const uploadPromises = formData.images.map(async (file, index) => {
          console.log(`Starting upload ${index + 1}/${formData.images.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          
          const imageFormData = new FormData();
          imageFormData.append('images', file);

          const imageResponse = await fetch('/api/upload-images', {
            method: 'POST',
            body: imageFormData,
          });

          console.log(`Image ${index + 1} upload response status:`, imageResponse.status);
          const responseText = await imageResponse.text();
          console.log(`Image ${index + 1} upload response text:`, responseText);

          if (imageResponse.ok) {
            let imageResult;
            try {
              imageResult = JSON.parse(responseText);
            } catch (parseError) {
              console.error(`Failed to parse image ${index + 1} upload response:`, parseError);
              throw new Error(`Invalid response from upload service for image ${index + 1}`);
            }
            
            if (imageResult.success && imageResult.urls && imageResult.urls.length > 0) {
              console.log(`Image ${index + 1} uploaded successfully:`, imageResult.urls[0]);
              return imageResult.urls[0];
            } else {
              console.error(`Upload failed for image ${index + 1}:`, imageResult);
              throw new Error(imageResult.error || `Failed to upload image ${index + 1}`);
            }
          } else {
            console.error(`Upload request failed for image ${index + 1} with status:`, imageResponse.status);
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch {
              errorData = { error: `Upload failed with status ${imageResponse.status}` };
            }
            throw new Error(errorData.error || `Upload failed for image ${index + 1} with status ${imageResponse.status}`);
          }
        });

        // Wait for all uploads to complete in parallel
        imageUrls = await Promise.all(uploadPromises);
        console.log('All images uploaded successfully in parallel:', imageUrls);
      }

      // Upload videos in parallel for better UX
      let videoUrls: string[] = [];
      if (formData.videos.length > 0) {
        setUploadProgress(`Uploading ${formData.videos.length} videos in parallel...`);
        console.log('Uploading videos in parallel...', formData.videos.length, 'files');
        
        // Create upload promises for all videos
        const uploadPromises = formData.videos.map(async (file, index) => {
          console.log(`Starting video upload ${index + 1}/${formData.videos.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          
          const videoFormData = new FormData();
          videoFormData.append('videos', file);

          const videoResponse = await fetch('/api/upload-videos', {
            method: 'POST',
            body: videoFormData,
          });

          console.log(`Video ${index + 1} upload response status:`, videoResponse.status);
          const responseText = await videoResponse.text();
          console.log(`Video ${index + 1} upload response text:`, responseText);

          if (videoResponse.ok) {
            let videoResult;
            try {
              videoResult = JSON.parse(responseText);
            } catch (parseError) {
              console.error(`Failed to parse video ${index + 1} upload response:`, parseError);
              throw new Error(`Invalid response from upload service for video ${index + 1}`);
            }
            
            if (videoResult.success && videoResult.urls && videoResult.urls.length > 0) {
              console.log(`Video ${index + 1} uploaded successfully:`, videoResult.urls[0]);
              return videoResult.urls[0];
            } else {
              console.error(`Upload failed for video ${index + 1}:`, videoResult);
              throw new Error(videoResult.error || `Failed to upload video ${index + 1}`);
            }
          } else {
            console.error(`Upload request failed for video ${index + 1} with status:`, videoResponse.status);
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch {
              errorData = { error: `Upload failed with status ${videoResponse.status}` };
            }
            throw new Error(errorData.error || `Upload failed for video ${index + 1} with status ${videoResponse.status}`);
          }
        });

        // Wait for all video uploads to complete in parallel
        videoUrls = await Promise.all(uploadPromises);
        console.log('All videos uploaded successfully in parallel:', videoUrls);
      }

      setUploadProgress('Creating property...');

      // Create API data directly without complex transformation
      const apiData = {
        // Basic Info
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        purpose: formData.category === 'PROPERTY_SALE' || formData.category === 'LANDED_PROPERTY' ? 'FOR_SALE' : 'FOR_RENT',

        // Location
        location: formData.address,
        streetAddress: formData.address,
        city: formData.city,
        state: formData.state,
        lga: formData.lga,
        country: 'Nigeria',
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        landmark: '',

        // Pricing
        price: parseInt(formData.price.replace(/,/g, '')) * 100, // Convert to kobo
        currency: 'NGN' as const,
        isNegotiable: true,

        // Property Details
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        toilets: formData.bathrooms || 0,
        sizeInSqm: formData.area || null,
        parkingSpaces: 0,
        features: formData.amenities,
        condition: 'NEW' as const,

        // Media
        images: imageUrls,
        videos: videoUrls,
        virtualTourUrl: '',
        floorPlanUrl: '',

        // Legal Documents (admin properties are assumed to have proper docs)
        titleDocuments: {
          hasTitleDeed: true,
          hasSurveyPlan: true,
          hasBuildingApproval: true,
          hasCertificateOfOccupancy: true,
          hasDeedOfAssignment: false,
          hasPowerOfAttorney: false,
        },
        ownershipType: 'FREEHOLD' as const,
        legalStatus: 'CLEAR' as const,

        // Availability
        availabilityStatus: 'AVAILABLE' as const,
        availableFrom: new Date(),
        inspectionType: 'BY_APPOINTMENT' as const,

        // Contact
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,

        // Admin specific
        isFeatured: formData.isFeatured,
        isActive: true,
        moderationStatus: 'APPROVED' as const,
      };

      console.log('Submitting property data:', apiData);

      // Use the main properties API endpoint
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Property created successfully!' });
        setTimeout(() => {
          router.push('/admin/properties');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || data.message || 'Failed to create property'
        });
      }
    } catch (error: any) {
      console.error('Error creating property:', error);
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred while creating the property'
      });
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  };

  // Common amenities list
  const commonAmenities = [
    'Air Conditioning', 'Parking', 'Swimming Pool', 'Gym', 'Garden', 
    'Security', 'Elevator', 'Balcony', 'Furnished', 'Pet Friendly',
    'Internet', 'Generator', 'Water Heater', 'Wardrobe', 'Kitchen Appliances'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Property</h1>
        <p className="text-gray-600 mt-2">Add a new property listing (automatically approved)</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {uploadProgress && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            {uploadProgress}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter property title (minimum 10 characters)"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="PROPERTY_SALE">Property Sale</option>
                <option value="LONG_TERM_RENTAL">Long Term Rental</option>
                <option value="SHORT_STAY">Short Stay</option>
                <option value="LANDED_PROPERTY">Landed Property</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₦) *
              </label>
              <input
                type="text"
                id="price"
                name="price"
                required
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter price (minimum ₦100,000)"
              />
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                min="0"
                value={formData.bedrooms || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Number of bedrooms"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                min="0"
                value={formData.bathrooms || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Number of bathrooms"
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                Area
              </label>
              <div className="flex space-x-2">
              <input
                type="number"
                  id="area"
                  name="area"
                min="0"
                  value={formData.area || ''}
                onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Property area"
                />
                <select
                  name="areaUnit"
                  value={formData.areaUnit}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="sqm">sqm</option>
                  <option value="sqft">sqft</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Feature this property on the home page
                </span>
              </label>
          </div>

            <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe the property (minimum 50 characters)..."
            />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter full street address"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter state"
              />
            </div>

            <div>
              <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-1">
                LGA (Local Government Area) *
              </label>
              <input
                type="text"
                id="lga"
                name="lga"
                required
                value={formData.lga}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter LGA"
              />
            </div>

            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude (Optional)
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                step="any"
                value={formData.latitude || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter latitude"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude (Optional)
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                step="any"
                value={formData.longitude || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter longitude"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Amenities & Features *</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {commonAmenities.map((amenity) => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Media</h2>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images * (Max 4.5MB each)
            </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
              onChange={(e) => handleFileChange(e, 'images')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                      src={URL.createObjectURL(file)}
                      alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                      onClick={() => removeFile(index, 'images')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Videos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Videos (Optional, Max 30MB each)
            </label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
              onChange={(e) => handleFileChange(e, 'videos')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              {formData.videos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.videos.map((file, index) => (
                    <div key={index} className="relative">
                      <video
                      src={URL.createObjectURL(file)}
                        className="w-full h-24 object-cover rounded-md"
                        controls
                      />
                      <button
                        type="button"
                      onClick={() => removeFile(index, 'videos')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter contact phone number"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                required
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter contact email"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/properties')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating Property...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
} 