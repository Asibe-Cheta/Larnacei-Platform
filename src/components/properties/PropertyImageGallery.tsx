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

  const renderImage = (image: PropertyImage, className: string, onClick?: () => void) => {
    // Handle blob URLs and Cloudinary URLs differently
    if (image.url.startsWith('blob:')) {
      return (
        <img
          src={image.url}
          alt={image.alt || 'Property image'}
          className={className}
          onClick={onClick}
          onLoad={() => setIsLoading(false)}
          crossOrigin="anonymous"
        />
      );
    } else {
      return (
        <Image
          src={image.url}
          alt={image.alt || 'Property image'}
          fill
          className={className}
          onClick={onClick}
          onLoad={() => setIsLoading(false)}
        />
      );
    }
  };

  const renderThumbnail = (image: PropertyImage, className: string, onClick?: () => void) => {
    if (image.url.startsWith('blob:')) {
      return (
        <img
          src={image.url}
          alt={image.alt || 'Property image'}
          className={className}
          onClick={onClick}
          crossOrigin="anonymous"
        />
      );
    } else {
      return (
        <Image
          src={image.url}
          alt={image.alt || 'Property image'}
          fill
          className={className}
          onClick={onClick}
        />
      );
    }
  };

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {renderImage(
          currentImage,
          `object-cover w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
          }`,
          () => onLightboxToggle(true)
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="mt-4 flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${index === activeIndex ? 'border-blue-500' : 'border-transparent'
                }`}
              onClick={() => onImageChange(index)}
            >
              {renderThumbnail(
                image,
                'object-cover w-full h-full'
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => onLightboxToggle(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => onLightboxToggle(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative aspect-video">
              {renderImage(
                currentImage,
                'object-contain w-full h-full'
              )}
            </div>

            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 