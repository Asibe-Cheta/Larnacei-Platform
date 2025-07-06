'use client';

import { useState } from 'react';
import { PropertyType } from '@prisma/client';

interface SearchData {
  location: string;
  propertyType: string;
}

interface SearchHeaderProps {
  onSearch: (searchData: SearchData) => void;
  initialData?: Partial<SearchData>;
}

export default function SearchHeader({ onSearch, initialData }: SearchHeaderProps) {
  const [searchData, setSearchData] = useState<SearchData>({
    location: initialData?.location || '',
    propertyType: initialData?.propertyType || 'All Types'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 py-6 mb-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Enter city, area, or landmark"
                  value={searchData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="property-type">
                Property Type
              </label>
              <select
                className="w-full py-3 px-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white"
                id="property-type"
                name="propertyType"
                value={searchData.propertyType}
                onChange={handleInputChange}
              >
                <option>All Types</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Land</option>
                <option>Commercial</option>
                <option>Duplex</option>
                <option>Villa</option>
                <option>Studio</option>
                <option>Penthouse</option>
              </select>
            </div>
            
            <button className="btn btn-primary w-full py-3 text-lg md:mt-0 mt-4" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 