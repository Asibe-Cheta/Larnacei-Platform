'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyImageGallery from '@/components/properties/PropertyImageGallery';
import PropertyInfo from '@/components/properties/PropertyInfo';
import ContactForm from '@/components/properties/ContactForm';
import SimilarProperties from '@/components/properties/SimilarProperties';
import OwnerProfile from '@/components/properties/OwnerProfile';
import { Property, PropertyType } from '@prisma/client';

interface PropertyWithDetails extends Property {
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    accountType: string;
    isVerified: boolean;
    verificationLevel: string;
    location: string | null;
    experience: number | null;
    specialization: string[];
    contactPreference: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }>;
  videos: Array<{
    id: string;
    url: string;
    title: string | null;
    type: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  _count: {
    images: number;
    videos: number;
    reviews: number;
    inquiries: number;
    favorites: number;
  };
}

interface PropertyResponse {
  success: boolean;
  message: string;
  data: PropertyWithDetails;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${propertyId}`);
        const data: PropertyResponse = await response.json();

        if (data.success) {
          setProperty(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch property details');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading property details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
              <p className="text-gray-600 mb-4">{error || 'The property you are looking for does not exist.'}</p>
              <a href="/properties" className="btn btn-primary">
                Browse All Properties
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-red-600">Home</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href="/properties" className="hover:text-red-600">Properties</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">
              {property.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <PropertyImageGallery
              images={property.images}
              activeIndex={activeImageIndex}
              onImageChange={setActiveImageIndex}
              onLightboxToggle={setShowLightbox}
              showLightbox={showLightbox}
            />

            {/* Property Information */}
            <PropertyInfo property={property} />

            {/* Owner Profile */}
            <OwnerProfile owner={property.owner} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <ContactForm
              propertyId={property.id}
              owner={property.owner}
              propertyTitle={property.title}
              propertyLocation={`${property.city}, ${property.state}`}
              propertyPrice={property.price}
              propertyCurrency={property.currency}
            />

            {/* Larnacei Verification Service */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-sm border-2 border-red-200 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  🛡️ Secure Transaction Guarantee
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Want peace of mind? Let us handle the entire verification and validation process for this property transaction.
                </p>
                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Property authenticity verification</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Owner legitimacy confirmation</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Legal documentation support</span>
                  </div>
                </div>
                <a
                  href={`mailto:info@larnaceiglobal.com?subject=Property Verification Request - Property ID: ${property.id}&body=Hello Larnacei Team,%0D%0A%0D%0AI am interested in having you handle the verification and validation process for this property:%0D%0A%0D%0AProperty: ${property.title}%0D%0ALocation: ${property.city}, ${property.state}%0D%0AProperty ID: ${property.id}%0D%0A%0D%0APlease contact me to discuss the verification process and your service fees.%0D%0A%0D%0AThank you!`}
                  className="inline-flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Let Us Handle The Process
                </a>
                <p className="text-xs text-gray-500 mt-3">
                  📞 Or call us: +234 123 456 7890
                </p>
                <p className="text-xs text-red-600 font-medium mt-1">
                  ⚠️ Avoid private dealings - Use our verified process!
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{property._count.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inquiries</span>
                  <span className="font-medium">{property._count.inquiries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorites</span>
                  <span className="font-medium">{property._count.favorites}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Photos</span>
                  <span className="font-medium">{property._count.images}</span>
                </div>
                {property._count.videos > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Videos</span>
                    <span className="font-medium">{property._count.videos}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn btn-outline flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save to Favorites
                </button>
                <button className="w-full btn btn-outline flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Property
                </button>
                <button className="w-full btn btn-outline flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        <SimilarProperties
          currentPropertyId={property.id}
          category={property.category}
          type={property.type}
          location={property.city}
        />
      </main>

      <Footer />
    </div>
  );
} 