'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property, PropertyCategory, PropertyType } from '@prisma/client';
import { formatPrice } from '@/utils/formatters';

interface PropertyWithDetails extends Property {
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }>;
  _count: {
    images: number;
    videos: number;
    reviews: number;
    inquiries: number;
  };
}

interface PropertyCardProps {
  property: PropertyWithDetails;
  viewMode: 'grid' | 'list';
}

export default function PropertyCard({ property, viewMode }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageIndex] = useState(0);
  const [showImageDots, setShowImageDots] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
  const hasMultipleImages = property.images.length > 1;

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite API call
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = `Hi, I'm interested in your property: ${property.title}`;
    const whatsappUrl = `https://wa.me/${property.owner.phone?.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.owner.phone) {
      window.location.href = `tel:${property.owner.phone}`;
    }
  };

  const getCategoryColor = (category: PropertyCategory) => {
    switch (category) {
      case 'SHORT_STAY':
        return 'bg-blue-100 text-blue-800';
      case 'LONG_TERM_RENTAL':
        return 'bg-green-100 text-green-800';
      case 'LANDED_PROPERTY':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROPERTY_SALE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: PropertyType) => {
    switch (type) {
      case 'APARTMENT':
        return 'bg-indigo-100 text-indigo-800';
      case 'HOUSE':
        return 'bg-orange-100 text-orange-800';
      case 'LAND':
        return 'bg-emerald-100 text-emerald-800';
      case 'COMMERCIAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `https://larnacei.com/properties/${property.id}`,
    "image": primaryImage?.url,
    "price": property.price,
    "priceCurrency": property.currency,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "addressRegion": property.state,
      "addressCountry": "NG"
    },
    "numberOfBedrooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.sizeInSqm,
      "unitCode": "MTK"
    },
    "category": property.category,
    "propertyType": property.type,
    "datePosted": property.createdAt,
    "dateModified": property.updatedAt
  };

  if (viewMode === 'list') {
    return (
      <div ref={cardRef} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        <Link href={`/properties/${property.id}`} className="block">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative md:w-80 md:h-48 h-48 md:flex-shrink-0">
              {isInView && primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || property.title}
                  fill
                  className={`object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 320px"
                  quality={75}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-t-none flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              
              {/* Loading skeleton */}
              {isInView && !imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
              )}
              
              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {property.images.length} photos
                </div>
              )}
              
              {/* Favorite Button */}
              <button
                onClick={handleFavoriteToggle}
                className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg
                  className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {property.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {formatPrice(property.price, property.currency)}
                      </div>
                      {property.isNegotiable && (
                        <span className="text-sm text-gray-500">Negotiable</span>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">
                      {property.city}, {property.state}
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center gap-6 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                        <span className="text-sm">{property.bedrooms} bed</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span className="text-sm">{property.bathrooms} bath</span>
                      </div>
                    )}
                    {property.sizeInSqm && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="text-sm">{property.sizeInSqm} sqm</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(property.category)}`}>
                      {property.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(property.type)}`}>
                      {property.type}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{property._count.inquiries} inquiries</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWhatsApp}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Contact via WhatsApp"
                      aria-label="Contact via WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleCall}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Call owner"
                      aria-label="Call owner"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <Link
                      href={`/properties/${property.id}`}
                      className="btn btn-primary text-sm px-4 py-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid View
  return (
    <div ref={cardRef} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <Link href={`/properties/${property.id}`} className="block">
        {/* Image Section */}
        <div 
          className="relative h-48"
          onMouseEnter={() => setShowImageDots(true)}
          onMouseLeave={() => setShowImageDots(false)}
        >
          {isInView && primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || property.title}
              fill
              className={`object-cover rounded-t-lg transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          
          {/* Loading skeleton */}
          {isInView && !imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg" />
          )}
          
          {/* Image Dots */}
          {hasMultipleImages && showImageDots && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.images.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === imageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {property.images.length}
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-bold text-red-600">
              {formatPrice(property.price, property.currency)}
            </div>
            {property.isNegotiable && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Negotiable
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm truncate">
              {property.city}, {property.state}
            </span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 mb-3">
            {property.bedrooms && (
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                <span className="text-sm">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span className="text-sm">{property.bathrooms}</span>
              </div>
            )}
            {property.sizeInSqm && (
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="text-sm">{property.sizeInSqm} sqm</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(property.category)}`}>
              {property.category.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(property.type)}`}>
              {property.type}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Contact via WhatsApp"
                aria-label="Contact via WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </button>
              <button
                onClick={handleCall}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Call owner"
                aria-label="Call owner"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
            
            <Link
              href={`/properties/${property.id}`}
              className="btn btn-primary text-sm px-3 py-1.5"
            >
              View Details
            </Link>
          </div>
        </div>
      </Link>
    </div>
  );
} 