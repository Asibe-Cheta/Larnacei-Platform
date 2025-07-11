'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property, PropertyCategory, PropertyType } from '@prisma/client';

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

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch('/api/properties/featured');
        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties);
        } else {
          setError('Failed to load featured properties');
        }
      } catch (err) {
        setError('Failed to load featured properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCategoryLabel = (category: PropertyCategory) => {
    switch (category) {
      case 'SHORT_STAY':
        return 'Short Stay';
      case 'LONG_TERM_RENTAL':
        return 'Long-term Rental';
      case 'PROPERTY_SALE':
        return 'Property Sale';
      case 'LANDED_PROPERTY':
        return 'Landed Property';
      default:
        return category;
    }
  };

  const getPriceType = (category: PropertyCategory) => {
    switch (category) {
      case 'SHORT_STAY':
        return '/night';
      case 'LONG_TERM_RENTAL':
        return '/year';
      default:
        return '';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="material-icons text-yellow-500">star</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="material-icons text-yellow-500">star_half</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="material-icons text-gray-300">star_border</span>
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="heading-font text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="heading-font text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Properties
          </h2>
          <div className="text-center text-gray-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="heading-font text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Properties
          </h2>
          <div className="text-center text-gray-600">
            <p>No featured properties available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="heading-font text-3xl md:text-4xl font-bold text-center mb-12">
          Featured Properties
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {properties.map((property) => {
            const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
            const imageUrl = primaryImage?.url || '/images/placeholder.jpg';
            
            return (
              <div key={property.id} className="property-card overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt={primaryImage?.alt || property.title}
                    width={400}
                    height={224}
                    className="w-full h-56 object-cover aspect-video"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {getCategoryLabel(property.category)}
                  </div>
                                     <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                     {property.type}
                   </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 heading-font line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1 flex items-center">
                    <span className="material-icons text-sm mr-1">place</span>
                    {property.city}, {property.state}
                  </p>
                  <p className="text-gray-800 font-bold text-lg mb-2">
                    {formatPrice(property.price, property.currency)}
                    {getPriceType(property.category) && (
                      <span className="font-normal text-sm">{getPriceType(property.category)}</span>
                    )}
                  </p>
                  
                  {/* Property Details */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <span className="flex items-center">
                        <span className="material-icons text-sm mr-1">bed</span>
                        {property.bedrooms} bed
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center">
                        <span className="material-icons text-sm mr-1">bathroom</span>
                        {property.bathrooms} bath
                      </span>
                    )}
                    {property.sizeInSqm && (
                      <span className="flex items-center">
                        <span className="material-icons text-sm mr-1">square_foot</span>
                        {property.sizeInSqm} sqm
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    href={`/properties/${property.id}`} 
                    className="btn btn-secondary w-full text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 