'use client';

import { useState } from 'react';
import { lgasByState } from '@/utils/nigeria-lga';
import { PropertyCategory, PropertyType, PropertyCondition, FurnishingStatus, Currency } from '@prisma/client';

interface Filters {
  query: string;
  category: string;
  type: string;
  state: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  sortBy: string;
  sortOrder: string;
}

interface PropertyFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClose?: () => void;
}

const nigerianStates = Object.keys(lgasByState);
const propertyCategories = Object.values(PropertyCategory);
const propertyTypes = Object.values(PropertyType);
const propertyConditions = Object.values(PropertyCondition);
const furnishingStatuses = Object.values(FurnishingStatus);
const currencies = Object.values(Currency);

const quickPriceRanges = [
  { label: 'Under ₦5M', min: '0', max: '500000000' },
  { label: '₦5M - ₦10M', min: '500000000', max: '1000000000' },
  { label: '₦10M - ₦25M', min: '1000000000', max: '2500000000' },
  { label: '₦25M - ₦50M', min: '2500000000', max: '5000000000' },
  { label: '₦50M - ₦100M', min: '5000000000', max: '10000000000' },
  { label: 'Over ₦100M', min: '10000000000', max: '' },
];

const amenities = [
  'Swimming Pool', 'Generator', 'Security', 'BQ', 'Garden', 'Gym',
  'Internet', 'Air Conditioning', 'Furnished', 'Parking', 'Water',
  'Electricity', 'Fence', 'Gate', 'CCTV', 'Staff Quarters'
];

export default function PropertyFilters({ filters, onFilterChange, onClose }: PropertyFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['price', 'location']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleQuickPriceSelect = (min: string, max: string) => {
    onFilterChange({ minPrice: min, maxPrice: max });
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(newAmenities);
    // TODO: Implement amenities filter in API
  };

  const clearAllFilters = () => {
    onFilterChange({
      query: '',
      category: '',
      type: '',
      state: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setSelectedAmenities([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.state) count++;
    if (filters.city) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (selectedAmenities.length > 0) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 lg:sticky lg:top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Price Range</h4>
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform ${
                expandedSections.includes('price') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.includes('price') && (
            <div className="mt-4 space-y-4">
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  value={filters.currency || 'NGN'}
                  onChange={(e) => onFilterChange({ currency: e.target.value })}
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency === 'NGN' ? '₦ Naira' : currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Price Ranges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {quickPriceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPriceSelect(range.min, range.max)}
                      className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                        filters.minPrice === range.min && filters.maxPrice === range.max
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Price Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="₦0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="₦∞"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('location')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Location</h4>
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform ${
                expandedSections.includes('location') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.includes('location') && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  value={filters.state}
                  onChange={(e) => onFilterChange({ state: e.target.value, city: '' })}
                >
                  <option value="">All States</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {filters.state && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City/LGA
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={filters.city}
                    onChange={(e) => onFilterChange({ city: e.target.value })}
                  >
                    <option value="">All Cities/LGAs</option>
                    {lgasByState[filters.state]?.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Property Type */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Property Type</h4>
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform ${
                expandedSections.includes('type') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.includes('type') && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  value={filters.category}
                  onChange={(e) => onFilterChange({ category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {propertyCategories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  value={filters.type}
                  onChange={(e) => onFilterChange({ type: e.target.value })}
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('details')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Property Details</h4>
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform ${
                expandedSections.includes('details') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.includes('details') && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={filters.bedrooms}
                    onChange={(e) => onFilterChange({ bedrooms: e.target.value })}
                  >
                    <option value="">Any</option>
                    <option value="0">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={filters.bathrooms}
                    onChange={(e) => onFilterChange({ bathrooms: e.target.value })}
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection('amenities')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Amenities</h4>
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform ${
                expandedSections.includes('amenities') ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.includes('amenities') && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {amenities.map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="sortBy"
                value="createdAt"
                checked={filters.sortBy === 'createdAt'}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Date Listed</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortBy"
                value="price"
                checked={filters.sortBy === 'price'}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Price</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortBy"
                value="viewCount"
                checked={filters.sortBy === 'viewCount'}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Most Popular</span>
            </label>
          </div>

          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                value="desc"
                checked={filters.sortOrder === 'desc'}
                onChange={(e) => onFilterChange({ sortOrder: e.target.value })}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Descending</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                value="asc"
                checked={filters.sortOrder === 'asc'}
                onChange={(e) => onFilterChange({ sortOrder: e.target.value })}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ascending</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 