'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [searchData, setSearchData] = useState({
    location: '',
    propertyType: 'All Types'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Search:', searchData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="hero-gradient text-white py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="heading-font text-4xl md:text-6xl font-bold mb-4">
          Find Your Perfect Property in Nigeria & Beyond
        </h1>
        <p className="text-lg md:text-xl mb-10">
          From vacation stays to dream homes, land investments to rental properties
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          <Link href="/short-stays" className="btn btn-outline-white text-lg py-4">
            Short Stays
          </Link>
          <Link href="/rentals" className="btn btn-outline-white text-lg py-4">
            Long-term Rentals
          </Link>
          <Link href="/land-sales" className="btn btn-outline-white text-lg py-4">
            Landed Properties
          </Link>
          <Link href="/property-sales" className="btn btn-outline-white text-lg py-4">
            Property Sales
          </Link>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto text-gray-700">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-left mb-1" htmlFor="location">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-gray-400">place</span>
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
              <label className="block text-sm font-medium text-left mb-1" htmlFor="property-type">
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
              </select>
            </div>
            
            <button className="btn btn-primary w-full py-3 text-lg md:mt-0 mt-4" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
} 