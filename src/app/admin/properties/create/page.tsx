'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mobileUploadHandler } from '@/utils/mobile-upload';

export default function CreatePropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'HOUSE',
    category: 'PROPERTY_SALE',
    bedrooms: '',
    bathrooms: '',
    size: '',
    city: '',
    state: '',
    address: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    features: [] as string[],
    amenities: [] as string[],
    images: [] as string[],
    videos: [] as string[],
    isFeatured: false,
  });

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async () => {
    if (selectedImageFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await mobileUploadHandler.uploadFiles(selectedImageFiles, 'image');

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      setSelectedImageFiles([]);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to upload images. Please try again.'
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoUpload = async () => {
    if (selectedVideoFiles.length === 0) return;

    setUploadingVideos(true);
    try {
      const uploadedUrls = await mobileUploadHandler.uploadFiles(selectedVideoFiles, 'video');

      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...uploadedUrls]
      }));
      setSelectedVideoFiles([]);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Video upload error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to upload videos. Please try again.'
      });
    } finally {
      setUploadingVideos(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Use mobile upload utility for validation
    const validFiles = files.filter(file => {
      const validation = mobileUploadHandler.validateFile(file, 'image');
      if (!validation.isValid) {
        setMessage({
          type: 'error',
          text: validation.errors.join('\n')
        });
        return false;
      }
      return true;
    });
    setSelectedImageFiles(validFiles);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Use mobile upload utility for validation
    const validFiles = files.filter(file => {
      const validation = mobileUploadHandler.validateFile(file, 'video');
      if (!validation.isValid) {
        setMessage({
          type: 'error',
          text: validation.errors.join('\n')
        });
        return false;
      }
      return true;
    });
    setSelectedVideoFiles(validFiles);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Convert string values to numbers and map to API schema
      const submitData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        type: formData.type,
        category: formData.category,
        purpose: 'SALE', // Default to SALE for admin-created properties
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        sizeInSqm: parseFloat(formData.size) || 0, // Map 'size' to 'sizeInSqm'
        city: formData.city,
        state: formData.state,
        location: formData.address, // Map 'address' to 'location'
        streetAddress: formData.address, // Also map to streetAddress
        lga: '', // Optional field
        landmark: '', // Optional field
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        features: formData.features,
        amenities: formData.amenities,
        images: formData.images,
        videos: formData.videos,
        isFeatured: formData.isFeatured,
      };

      console.log('Submitting property data:', submitData);

      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Property created successfully!' });
        setTimeout(() => {
          router.push('/admin/properties');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to create property'
        });
      }
    } catch (error) {
      console.error('Error creating property:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred while creating the property'
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                placeholder="Enter property title"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter price"
              />
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
                <option value="CONDO">Condo</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
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
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                min="0"
                value={formData.bedrooms}
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
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Number of bathrooms"
              />
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                Size (sq ft)
              </label>
              <input
                type="number"
                id="size"
                name="size"
                min="0"
                step="0.01"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Property size"
              />
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
          </div>

          <div className="mt-4">
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
              placeholder="Describe the property..."
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter full address"
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
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter postal code"
              />
            </div>

            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                step="any"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter latitude"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                step="any"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter longitude"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Media</h2>

          {/* Image Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Images</h3>
            <div className="space-y-4">
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                {selectedImageFiles.length > 0 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadingImages}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload Images'}
                    </button>
                  </div>
                )}
              </div>

              {/* Display uploaded images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
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

          {/* Video Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Videos</h3>
            <div className="space-y-4">
              <div>
                <input
                  ref={videoInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                {selectedVideoFiles.length > 0 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleVideoUpload}
                      disabled={uploadingVideos}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {uploadingVideos ? 'Uploading...' : 'Upload Videos'}
                    </button>
                  </div>
                )}
              </div>

              {/* Display uploaded videos */}
              {formData.videos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.videos.map((url, index) => (
                    <div key={index} className="relative">
                      <video
                        src={url}
                        className="w-full h-24 object-cover rounded-md"
                        controls
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
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
        </div>

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
            {isLoading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
} 