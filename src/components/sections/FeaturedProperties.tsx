'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  priceType: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  isFavorite: boolean;
}

const featuredProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa in Lekki',
    location: 'Lekki Phase 1, Lagos',
    price: '₦250,000,000',
    priceType: '',
    category: 'Property Sales',
    rating: 4,
    reviewCount: 15,
    image: '/images/hs6.jpg',
    isFavorite: false
  },
  {
    id: '2',
    title: 'Cozy Ikoyi Getaway',
    location: 'Ikoyi, Lagos',
    price: '₦50,000',
    priceType: '/night',
    category: 'Short Stays',
    rating: 4.5,
    reviewCount: 28,
    image: '/images/hs5.jpg',
    isFavorite: false
  },
  {
    id: '3',
    title: 'Spacious Ikeja Home',
    location: 'Ikeja GRA, Lagos',
    price: '₦5,000,000',
    priceType: '/year',
    category: 'Long-term Rentals',
    rating: 5,
    reviewCount: 8,
    image: '/images/hs4.jpg',
    isFavorite: false
  },
  {
    id: '4',
    title: 'Epe Investment Plot',
    location: 'Epe, Lagos',
    price: '₦15,000,000',
    priceType: '',
    category: 'Landed Properties',
    rating: 0,
    reviewCount: 0,
    image: '/images/hs1.jpg',
    isFavorite: false
  }
];

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>(featuredProperties);

  const toggleFavorite = (propertyId: string) => {
    setProperties(properties.map(property => 
      property.id === propertyId 
        ? { ...property, isFavorite: !property.isFavorite }
        : property
    ));
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="heading-font text-3xl md:text-4xl font-bold text-center mb-12">
          Featured Properties
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {properties.map((property) => (
            <div key={property.id} className="property-card overflow-hidden">
              <div className="relative">
                <Image
                  src={property.image}
                  alt={property.title}
                  width={400}
                  height={224}
                  className="w-full h-56 object-cover aspect-video"
                />
                <div className="category-badge">{property.category}</div>
                <button
                  className="absolute top-3 right-3 text-white bg-black bg-opacity-30 p-2 rounded-full hover:text-red-500 transition-colors"
                  onClick={() => toggleFavorite(property.id)}
                >
                  <span className="material-icons">
                    {property.isFavorite ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 heading-font">
                  {property.title}
                </h3>
                <p className="text-gray-600 text-sm mb-1 flex items-center">
                  <span className="material-icons text-sm mr-1">place</span>
                  {property.location}
                </p>
                <p className="text-gray-800 font-bold text-lg mb-2">
                  {property.price}
                  {property.priceType && (
                    <span className="font-normal text-sm">{property.priceType}</span>
                  )}
                </p>
                
                <div className="flex items-center mb-4">
                  {property.rating > 0 ? (
                    <>
                      {renderStars(property.rating)}
                      <span className="text-sm text-gray-500 ml-2">
                        ({property.reviewCount} Reviews)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 ml-2">No reviews yet</span>
                  )}
                </div>
                
                <Link href={`/property/${property.id}`} className="btn btn-secondary w-full text-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 