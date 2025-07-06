'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Eye,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  Star
} from 'lucide-react';

interface PendingProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  category: string;
  owner: {
    name: string;
    email: string;
    phone: string;
    verificationStatus: string;
    kycStatus: string;
    joinedAt: string;
  };
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
  imageCount: number;
  hasLegalDocs: boolean;
  isVerified: boolean;
  image?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  legalDocuments: Array<{
    id: string;
    type: string;
    status: string;
  }>;
  totalImages: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PropertyModerationPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Build query params
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filter && filter !== 'all') {
    params.append('filter', filter);
  }
  params.append('page', String(page));
  params.append('limit', String(limit));

  const { data, isLoading, error } = useSWR(`/api/admin/moderation?${params.toString()}`, fetcher);
  const properties = data?.properties || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map((p: PendingProperty) => p.id));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          propertyIds: selectedProperties,
          reason: action === 'reject' ? 'Rejected by admin' : null
        }),
      });

      if (response.ok) {
        // Refresh data
        window.location.reload();
      } else {
        console.error('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
    setSelectedProperties([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unverified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'SHORT_STAY':
        return 'Short Stay';
      case 'LONG_TERM_RENTAL':
        return 'Long Term Rental';
      case 'PROPERTY_SALE':
        return 'Property Sale';
      case 'LANDED_PROPERTY':
        return 'Landed Property';
      default:
        return category;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading pending properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="mt-2 text-red-600">Error loading moderation data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Moderation</h1>
          <p className="mt-1 text-gray-600">
            Review and approve pending property listings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedProperties.length > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('approve')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve ({selectedProperties.length})
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject ({selectedProperties.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter((p: PendingProperty) => p.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Owners</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter((p: PendingProperty) => p.isVerified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Legal Docs</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter((p: PendingProperty) => p.hasLegalDocs).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search properties, locations, or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Properties</option>
              <option value="verified">Verified Owners</option>
              <option value="unverified">Unverified Owners</option>
              <option value="high-priority">High Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === properties.length && properties.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property: PendingProperty) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handleSelectProperty(property.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-16">
                        <img
                          className="h-12 w-16 object-cover rounded-lg"
                          src={property.image || '/images/placeholder.jpg'}
                          alt={property.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={property.title}>
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-[200px] truncate" title={property.location}>
                          {property.location}
                        </div>
                        <div className="text-xs text-gray-400">
                          {getCategoryLabel(property.category)} • {formatCurrency(property.price, property.currency)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.owner.name}</div>
                    <div className="text-sm text-gray-500">{property.owner.email}</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(property.owner.verificationStatus)}`}>
                      {property.owner.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(property.priority)}`}>
                      {property.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{property.imageCount} images</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        <span>{property.hasLegalDocs ? 'Has docs' : 'No docs'}</span>
                      </div>
                      {property.bedrooms && (
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(property.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending properties</h3>
            <p className="mt-1 text-sm text-gray-500">
              All properties have been reviewed or there are no pending submissions.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 