'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  Search,
  Eye,
  Shield,
  CheckCircle,
  Clock,
  Phone,
  Calendar,
  Star,
  Home
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  console.log('Admin properties fetcher: Fetching from:', url);
  const res = await fetch(url);
  console.log('Admin properties fetcher response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Admin properties fetcher error response:', errorText);
    throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
  }

  const data = await res.json();
  console.log('Admin properties fetcher success data:', data);
  return data;
};

export default function AdminPropertiesPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const [propertiesTestInfo, setPropertiesTestInfo] = useState<any>(null);

  // Build query params
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filter && filter !== 'all') {
    if (['approved', 'pending', 'rejected'].includes(filter)) {
      params.append('moderationStatus', filter);
    } else if (filter === 'active') {
      params.append('isActive', 'true');
    } else if (filter === 'inactive') {
      params.append('isActive', 'false');
    }
  }
  params.append('page', String(page));
  params.append('limit', String(limit));

  const { data, isLoading, error, mutate } = useSWR(`/api/admin/properties?${params.toString()}`, fetcher);
  const properties = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Force data refresh on component mount
  useEffect(() => {
    console.log('Admin properties page: Component mounted, forcing data refresh');
    mutate();
  }, [mutate]);

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getModerationStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'HOUSE':
        return 'bg-blue-100 text-blue-800';
      case 'APARTMENT':
        return 'bg-purple-100 text-purple-800';
      case 'CONDO':
        return 'bg-indigo-100 text-indigo-800';
      case 'LAND':
        return 'bg-green-100 text-green-800';
      case 'COMMERCIAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApproveProperty = async (propertyId: string) => {
    setApprovingId(propertyId);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        mutate(); // Refresh data
      }
    } catch (error) {
      console.error('Error approving property:', error);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    setRejectingId(propertyId);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/reject`, {
        method: 'POST',
      });
      if (response.ok) {
        mutate(); // Refresh data
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
    } finally {
      setRejectingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Properties</h1>
            <p className="text-gray-600">Failed to load properties. Please try again.</p>
          </div>
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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="text-gray-600 mt-2">Manage and approve property listings</p>
            </div>
            <Link
              href="/"
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.moderationStatus === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.moderationStatus === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.moderationStatus === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Properties</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Property Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-gray-400" />
                      </div>
                      {property.moderationStatus === 'APPROVED' && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">{property.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{property.owner?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handleSelectProperty(property.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getModerationStatusColor(property.moderationStatus)}`}>
                    {property.moderationStatus}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPropertyTypeColor(property.type)}`}>
                    {property.type}
                  </span>
                  {property.isActive && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Listed {formatDate(property.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{property.bedrooms || 0} beds, {property.bathrooms || 0} baths</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{formatCurrency(property.price)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/properties/${property.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {property.moderationStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveProperty(property.id)}
                          disabled={approvingId === property.id}
                          className="p-2 text-green-400 hover:text-green-600 disabled:opacity-50"
                          title="Approve Property"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectProperty(property.id)}
                          disabled={rejectingId === property.id}
                          className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50"
                          title="Reject Property"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {property.moderationStatus === 'PENDING' && (
                      <span className="text-yellow-600">Needs Review</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 