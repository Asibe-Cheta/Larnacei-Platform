'use client';

import { Property, PropertyCategory, PropertyType, PropertyCondition, FurnishingStatus, Currency } from '@prisma/client';
import { formatPrice, formatPropertySize, formatDate } from '@/utils/formatters';

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
    favorites: number;
  };
}

interface PropertyInfoProps {
  property: PropertyWithDetails;
}

export default function PropertyInfo({ property }: PropertyInfoProps) {
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

  const getConditionColor = (condition: PropertyCondition) => {
    switch (condition) {
      case 'NEW':
        return 'bg-green-100 text-green-800';
      case 'EXCELLENT':
        return 'bg-blue-100 text-blue-800';
      case 'GOOD':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAIR':
        return 'bg-orange-100 text-orange-800';
      case 'POOR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const amenities = [
    { name: 'Swimming Pool', icon: '🏊' },
    { name: 'Generator', icon: '⚡' },
    { name: 'Security', icon: '🔒' },
    { name: 'BQ', icon: '🏠' },
    { name: 'Garden', icon: '🌿' },
    { name: 'Gym', icon: '💪' },
    { name: 'Internet', icon: '🌐' },
    { name: 'Air Conditioning', icon: '❄️' },
    { name: 'Furnished', icon: '🪑' },
    { name: 'Parking', icon: '🚗' },
    { name: 'Water', icon: '💧' },
    { name: 'Electricity', icon: '⚡' },
    { name: 'Fence', icon: '🏗️' },
    { name: 'Gate', icon: '🚪' },
    { name: 'CCTV', icon: '📹' },
    { name: 'Staff Quarters', icon: '👥' },
  ];

  const hasAmenity = (amenityName: string) => {
    return property.features.some(feature => 
      feature.toLowerCase().includes(amenityName.toLowerCase())
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(property.category)}`}>
                {property.category.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(property.type)}`}>
                {property.type}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getConditionColor(property.condition)}`}>
                {property.condition}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg">
                {property.streetAddress}, {property.city}, {property.state}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {formatPrice(property.price, property.currency)}
            </div>
            {property.isNegotiable && (
              <span className="text-sm text-gray-500">Negotiable</span>
            )}
            <div className="text-sm text-gray-600 mt-2">
              Listed {formatDate(property.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {property.description}
        </p>
      </div>

      {/* Key Specifications */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {property.bedrooms !== null && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
              <div className="text-sm text-gray-600">Bedrooms</div>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
              <div className="text-sm text-gray-600">Bathrooms</div>
            </div>
          )}
          {property.toilets !== null && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.toilets}</div>
              <div className="text-sm text-gray-600">Toilets</div>
            </div>
          )}
          {property.parkingSpaces !== null && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.parkingSpaces}</div>
              <div className="text-sm text-gray-600">Parking</div>
            </div>
          )}
          {property.sizeInSqm && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.sizeInSqm.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Square Meters</div>
            </div>
          )}
          {property.sizeInHectares && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.sizeInHectares}</div>
              <div className="text-sm text-gray-600">Hectares</div>
            </div>
          )}
          {property.yearBuilt && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.yearBuilt}</div>
              <div className="text-sm text-gray-600">Year Built</div>
            </div>
          )}
          {property.floorLevel !== null && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{property.floorLevel}</div>
              <div className="text-sm text-gray-600">Floor Level</div>
            </div>
          )}
        </div>
      </div>

      {/* Features & Amenities */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features & Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((amenity) => {
            const hasFeature = hasAmenity(amenity.name);
            return (
              <div
                key={amenity.name}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  hasFeature
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <span className="text-lg">{amenity.icon}</span>
                <span className="text-sm font-medium">{amenity.name}</span>
              </div>
            );
          })}
        </div>
        
        {property.features.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Features</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legal & Documentation */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal & Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Ownership Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ownership Type:</span>
                <span className="font-medium">{property.ownershipType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Legal Status:</span>
                <span className="font-medium">{property.legalStatus}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Title Documents</h3>
            <div className="space-y-2">
              {Object.entries(property.titleDocuments as Record<string, boolean>).map(([doc, available]) => (
                <div key={doc} className="flex items-center justify-between">
                  <span className="text-gray-600">{doc}:</span>
                  <span className={`font-medium ${available ? 'text-green-600' : 'text-red-600'}`}>
                    {available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Availability:</span>
                <span className="font-medium">{property.availabilityStatus}</span>
              </div>
              {property.availableFrom && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Available From:</span>
                  <span className="font-medium">{formatDate(property.availableFrom)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Inspection Type:</span>
                <span className="font-medium">{property.inspectionType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Furnishing</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Furnishing Status:</span>
                <span className="font-medium">
                  {property.furnishingStatus ? property.furnishingStatus.replace('_', ' ') : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 