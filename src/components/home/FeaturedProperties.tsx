'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/featured-properties');
        const data = await response.json();

        if (data.success) {
          setProperties(data.data);
        } else {
          setError('Failed to load featured properties');
        }
      } catch (err) {
        setError('Failed to load featured properties');
        console.error('Error fetching featured properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-gray-600">Discover our handpicked premium properties</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
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
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-gray-600">No featured properties available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
          <p className="text-gray-600">Discover our handpicked premium properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => {
            const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];

            return (
              <div key={property.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <Link href={`/properties/${property.id}`} className="block">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    {primaryImage ? (
                      primaryImage.url.startsWith('blob:') ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ) : (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt || property.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Featured Badge */}
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded font-bold">
                      Featured
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
                      {formatPrice(property.price, property.currency)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
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

                    {/* View Details Button */}
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View All Properties Link */}
        <div className="text-center mt-8">
          <Link
            href="/properties"
            className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
