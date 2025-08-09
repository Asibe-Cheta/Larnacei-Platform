'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, CheckCircle, Shield, Building, Calendar, Star, MapPin, Users, Phone, Mail } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  category: string;
  purpose: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  state: string;
  city: string;
  lga: string;
  address: string;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    accountType: string;
    isVerified: boolean;
    verificationLevel: string;
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
}

export default function AdminPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/admin/properties/${params.id}`);
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const data = await response.json();
        setProperty(data.property);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  const handleApproveProperty = async () => {
    if (!property) return;

    setApproving(true);
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        setProperty(prev => prev ? { ...prev, moderationStatus: 'APPROVED' } : null);
      } else {
        throw new Error('Failed to approve property');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve property');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectProperty = async () => {
    if (!property) return;

    setRejecting(true);
    try {
      const response = await fetch(`/api/admin/properties/${property.id}/reject`, {
        method: 'PUT',
      });

      if (response.ok) {
        setProperty(prev => prev ? { ...prev, moderationStatus: 'REJECTED' } : null);
      } else {
        throw new Error('Failed to reject property');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject property');
    } finally {
      setRejecting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getModerationStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Link
            href="/admin/properties"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/properties"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Properties
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Property Details</h1>
                <p className="text-gray-600 mt-1">Review and manage property listing</p>
              </div>
            </div>

            {/* Action Buttons */}
            {property.moderationStatus === 'PENDING' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleApproveProperty}
                  disabled={approving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {approving ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={handleRejectProperty}
                  disabled={rejecting}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {rejecting ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`px-3 py-1 text-sm font-medium rounded ${getModerationStatusColor(property.moderationStatus)}`}>
            {property.moderationStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            {property.images && property.images.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Property Images</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {property.images.map((image) => (
                      <div key={image.id} className="aspect-w-16 aspect-h-9">
                        <img
                          src={image.url}
                          alt={image.alt || 'Property image'}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600">{property.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{property.bedrooms || 0} bedrooms, {property.bathrooms || 0} bathrooms</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{property.city}, {property.state}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Listed {formatDate(property.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{formatCurrency(property.price)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Type</p>
                    <p className="text-sm text-gray-900">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Category</p>
                    <p className="text-sm text-gray-900">{property.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Purpose</p>
                    <p className="text-sm text-gray-900">{property.purpose}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Owner Information</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{property.owner.name || 'No name'}</p>
                    <p className="text-xs text-gray-500">{property.owner.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{property.owner.email}</span>
                  </div>
                  {property.owner.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{property.owner.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Role</p>
                      <p className="text-gray-900">{property.owner.role}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Account Type</p>
                      <p className="text-gray-900">{property.owner.accountType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Verification</p>
                      <p className="text-gray-900">{property.owner.verificationLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Verified</p>
                      <p className="text-gray-900">{property.owner.isVerified ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Property Status</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${property.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {property.isActive ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${property.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {property.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Featured</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${property.isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {property.isFeatured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
