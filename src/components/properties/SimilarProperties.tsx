'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PropertyCategory, PropertyType } from '@prisma/client';
import { formatPrice } from '@/utils/formatters';

interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  state: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeInSqm?: number;
  category: PropertyCategory;
  type: PropertyType;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }>;
}

interface SimilarPropertiesProps {
  currentPropertyId: string;
  category: PropertyCategory;
  type: PropertyType;
  location: string;
}

export default function SimilarProperties({
  currentPropertyId,
  category,
  type,
  location
}: SimilarPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          category: category,
          type: type,
          city: location,
          limit: '4',
          exclude: currentPropertyId,
        });

        const response = await fetch(`/api/properties?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setProperties(data.data);
        }
      } catch (err) {
        console.error('Error fetching similar properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [currentPropertyId, category, type, location]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Properties</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => {
          const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];

          return (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                {primaryImage ? (
                  primaryImage.url.startsWith('blob:') ? (
                    <img
                      src={primaryImage.url}
                      alt={primaryImage.alt || property.title}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt || property.title}
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="text-lg font-bold text-red-600 mb-2">
                  {formatPrice(property.price, property.currency)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm truncate">
                    {property.city}, {property.state}
                  </span>
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {property.bedrooms && property.bathrooms && (
                    <span>
                      {property.bedrooms} bed, {property.bathrooms} bath
                      {property.sizeInSqm && ` • ${property.sizeInSqm} sqm`}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link
          href={`/properties?category=${category}&type=${type}&city=${location}`}
          className="btn btn-outline"
        >
          View All Similar Properties
        </Link>
      </div>
    </div>
  );
} 