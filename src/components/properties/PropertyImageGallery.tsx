'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PropertyImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  activeIndex: number;
  onImageChange: (index: number) => void;
  onLightboxToggle: (show: boolean) => void;
  showLightbox: boolean;
}

export default function PropertyImageGallery({
  images,
  activeIndex,
  onImageChange,
  onLightboxToggle,
  showLightbox
}: PropertyImageGalleryProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
    );
  }

  const currentImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    onImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    onImageChange(newIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onLightboxToggle(false);
    }
  };

  return (
    <>
      {/* Main Image Gallery */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Main Image */}
        <div className="relative aspect-video bg-gray-100">
          {currentImage && (
            <Image
              src={currentImage.url}
              alt={currentImage.alt || 'Property image'}
              fill
              className="object-cover cursor-pointer"
              onClick={() => onLightboxToggle(true)}
              onLoad={() => setIsLoading(false)}
            />
          )}
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {activeIndex + 1} of {images.length}
            </div>
          )}

          {/* Zoom Icon */}
          <button
            onClick={() => onLightboxToggle(true)}
            className="absolute top-4 left-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>

        {/* Thumbnail Navigation */}
        {hasMultipleImages && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => onImageChange(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === activeIndex
                      ? 'border-red-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Property image ${index + 1}`}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => onLightboxToggle(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-7xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={() => onLightboxToggle(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main Image */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {currentImage && (
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || 'Property image'}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              )}

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white rounded-full p-3 transition-all"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white rounded-full p-3 transition-all"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                  {activeIndex + 1} of {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {hasMultipleImages && (
              <div className="mt-4 flex justify-center">
                <div className="flex gap-2 overflow-x-auto max-w-full">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageChange(index);
                      }}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        index === activeIndex
                          ? 'border-white'
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `Property image ${index + 1}`}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 