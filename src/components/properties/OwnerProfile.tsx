'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatPhoneNumber } from '@/utils/formatters';

interface Owner {
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
}

interface OwnerProfileProps {
  owner: Owner;
}

export default function OwnerProfile({ owner }: OwnerProfileProps) {
  const [showFullPhone, setShowFullPhone] = useState(false);

  const handleWhatsApp = () => {
    if (owner.phone) {
      const message = `Hi ${owner.name || 'there'}, I'm interested in your property listing.`;
      const whatsappUrl = `https://wa.me/${owner.phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleCall = () => {
    if (owner.phone) {
      window.location.href = `tel:${owner.phone}`;
    }
  };

  const handleEmail = () => {
    const subject = 'Property Inquiry';
    const body = `Hi ${owner.name || 'there'},\n\nI'm interested in your property listing and would like to know more details.\n\nBest regards`;
    const mailtoUrl = `mailto:${owner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getVerificationBadge = () => {
    if (owner.isVerified) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Verified</span>
        </div>
      );
    }
    return null;
  };

  const getRoleBadge = () => {
    if (owner.role === 'AGENT' || owner.role === 'AGENCY') {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          Professional Agent
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
        Private Owner
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Owner</h2>
        
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {owner.name ? (
                <span className="text-xl font-semibold text-gray-600">
                  {owner.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </div>

          {/* Owner Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {owner.name || 'Property Owner'}
              </h3>
              {getVerificationBadge()}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              {getRoleBadge()}
              {owner.accountType && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {owner.accountType}
                </span>
              )}
            </div>

            {/* Professional Info */}
            {(owner.experience || owner.specialization.length > 0) && (
              <div className="mb-4">
                {owner.experience && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{owner.experience} years</span> of experience
                  </p>
                )}
                {owner.specialization.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Specializes in: {owner.specialization.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            {owner.location && (
              <div className="flex items-center text-gray-600 mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{owner.location}</span>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3">
              {/* Phone */}
              {owner.phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">
                      {showFullPhone ? formatPhoneNumber(owner.phone) : 'Phone number available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFullPhone(!showFullPhone)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {showFullPhone ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={handleCall}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Call owner"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Contact via WhatsApp"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{owner.email}</span>
                </div>
                <button
                  onClick={handleEmail}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Send email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contact Preference */}
            {owner.contactPreference && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Preferred contact method:</span> {owner.contactPreference.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </button>
            <button
              onClick={handleCall}
              className="flex-1 btn btn-outline flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 