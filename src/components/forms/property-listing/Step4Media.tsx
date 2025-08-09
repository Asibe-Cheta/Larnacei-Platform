'use client';

import { useState, useRef } from 'react';

interface PropertyListingData {
  images: File[];
  videos: File[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;
}

interface Step4MediaProps {
  formData: PropertyListingData;
  updateFormData: (updates: Partial<PropertyListingData>) => void;
}

export default function Step4Media({ formData, updateFormData }: Step4MediaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [dragType, setDragType] = useState<'images' | 'videos' | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent, type: 'images' | 'videos') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
      setDragType(type);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
      setDragType(null);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'images' | 'videos') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragType(null);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      if (type === 'images') {
        return file.type.startsWith('image/');
      } else {
        return file.type.startsWith('video/');
      }
    });

    if (validFiles.length > 0) {
      const currentFiles = type === 'images' ? formData.images : formData.videos;
      const maxFiles = type === 'images' ? 20 : 5;
      const maxSize = type === 'images' ? 4.5 * 1024 * 1024 : 30 * 1024 * 1024; // 4.5MB for images, 30MB for videos

      if (currentFiles.length + validFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} ${type} allowed`);
        return;
      }

      // Check file sizes
      const oversizedFiles = validFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        const maxSizeMB = type === 'images' ? 4.5 : 30;
        alert(`${type} files must be under ${maxSizeMB}MB each. Please compress your files and try again.`);
        return;
      }

      updateFormData({ [type]: [...currentFiles, ...validFiles] });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos') => {
    const files = Array.from(e.target.files || []);
    const currentFiles = type === 'images' ? formData.images : formData.videos;
    const maxFiles = type === 'images' ? 20 : 5;
    const maxSize = type === 'images' ? 4.5 * 1024 * 1024 : 30 * 1024 * 1024; // 4.5MB for images, 30MB for videos

    if (currentFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} ${type} allowed`);
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      const maxSizeMB = type === 'images' ? 4.5 : 30;
      alert(`${type} files must be under ${maxSizeMB}MB each. Please compress your files and try again.`);
      return;
    }

    updateFormData({ [type]: [...currentFiles, ...files] });
  };

  const removeFile = (index: number, type: 'images' | 'videos') => {
    const currentFiles = type === 'images' ? formData.images : formData.videos;
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    updateFormData({ [type]: updatedFiles });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = (file: File, type: 'images' | 'videos') => {
    if (type === 'images') {
      return URL.createObjectURL(file);
    } else {
      return '/images/video-placeholder.png'; // You can add a video placeholder image
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Media & Photos</h2>
        <p className="text-gray-600">Upload high-quality photos and videos to showcase your property.</p>
      </div>

      {/* Images Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Property Photos</h3>
          <span className="text-sm text-gray-500">
            {formData.images.length}/20 photos
          </span>
        </div>

        {/* Image Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive && dragType === 'images'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
            }`}
          onDragEnter={(e) => handleDrag(e, 'images')}
          onDragLeave={(e) => handleDrag(e, 'images')}
          onDragOver={(e) => handleDrag(e, 'images')}
          onDrop={(e) => handleDrop(e, 'images')}
        >
          <div className="space-y-4">
            <span className="material-icons text-4xl text-gray-400">photo_camera</span>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your photos here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, JPEG up to 4.5MB each. Maximum 20 photos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="px-4 py-2 primary-bg text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Select Photos
            </button>
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'images')}
              className="hidden"
            />
          </div>
        </div>

        {/* Image Preview Grid */}
        {formData.images.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={getFilePreview(file, 'images')}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index, 'images')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Property Videos</h3>
          <span className="text-sm text-gray-500">
            {formData.videos.length}/5 videos
          </span>
        </div>

        {/* Video Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive && dragType === 'videos'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
            }`}
          onDragEnter={(e) => handleDrag(e, 'videos')}
          onDragLeave={(e) => handleDrag(e, 'videos')}
          onDragOver={(e) => handleDrag(e, 'videos')}
          onDrop={(e) => handleDrop(e, 'videos')}
        >
          <div className="space-y-4">
            <span className="material-icons text-4xl text-gray-400">videocam</span>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your videos here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                MP4, MOV, AVI up to 30MB each. Maximum 5 videos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="px-4 py-2 primary-bg text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Select Videos
            </button>
            <input
              ref={videoInputRef}
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => handleFileSelect(e, 'videos')}
              className="hidden"
            />
          </div>
        </div>

        {/* Video Preview List */}
        {formData.videos.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Videos</h4>
            <div className="space-y-3">
              {formData.videos.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="material-icons text-gray-400">video_file</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index, 'videos')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Media URLs */}
      <div className="space-y-6 mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Media Links</h3>

        <div>
          <label htmlFor="virtualTourUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Virtual Tour URL (Optional)
          </label>
          <input
            type="url"
            id="virtualTourUrl"
            value={formData.virtualTourUrl || ''}
            onChange={(e) => updateFormData({ virtualTourUrl: e.target.value })}
            placeholder="https://example.com/virtual-tour"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Link to virtual tour (YouTube, Matterport, etc.)
          </p>
        </div>

        <div>
          <label htmlFor="floorPlanUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Floor Plan URL (Optional)
          </label>
          <input
            type="url"
            id="floorPlanUrl"
            value={formData.floorPlanUrl || ''}
            onChange={(e) => updateFormData({ floorPlanUrl: e.target.value })}
            placeholder="https://example.com/floor-plan"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Link to floor plan image or PDF
          </p>
        </div>
      </div>

      {/* Media Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Media Upload Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use high-quality photos (minimum 1200x800 pixels)</li>
          <li>• Include photos of all rooms, exterior, and key features</li>
          <li>• First photo will be the main listing image</li>
          <li>• Videos should be under 2 minutes for better loading</li>
          <li>• Ensure good lighting and clean spaces in photos</li>
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Media Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Photos:</strong> {formData.images.length}/20 uploaded</p>
          <p><strong>Videos:</strong> {formData.videos.length}/5 uploaded</p>
          <p><strong>Total Files:</strong> {formData.images.length + formData.videos.length}</p>
        </div>
      </div>
    </div>
  );
} 