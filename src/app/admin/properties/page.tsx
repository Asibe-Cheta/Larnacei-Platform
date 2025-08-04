'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Star,
  CheckCircle,
  XCircle,
  Home,
  Building,
  TrendingUp,
  Users,
  MapPin,
  Clock
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPropertiesPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const limit = 20;

  // Build query params
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filter && filter !== 'all') {
    params.append('type', filter);
  }
  params.append('page', String(page));
  params.append('limit', String(limit));

  const { data, isLoading, error, mutate } = useSWR(`/api/admin/properties?${params.toString()}`, fetcher);
  const properties = data?.properties || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleApprove = async (propertyId: string) => {
    if (!confirm('Are you sure you want to approve this property?')) return;

    setApprovingId(propertyId);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Approved by admin',
          featured: false,
        }),
      });

      if (response.ok) {
        // Refresh the data
        mutate();
        alert('Property approved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to approve property: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to approve property. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (propertyId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setRejectingId(propertyId);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: reason,
        }),
      });

      if (response.ok) {
        // Refresh the data
        mutate();
        alert('Property rejected successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to reject property: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to reject property. Please try again.');
    } finally {
      setRejectingId(null);
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'APARTMENT':
        return <Home className="w-4 h-4" />;
      case 'HOUSE':
        return <Building className="w-4 h-4" />;
      case 'LAND':
        return <MapPin className="w-4 h-4" />;
      case 'COMMERCIAL':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'APARTMENT':
        return 'bg-blue-100 text-blue-800';
      case 'HOUSE':
        return 'bg-green-100 text-green-800';
      case 'LAND':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMMERCIAL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'APARTMENT':
        return 'Apartment';
      case 'HOUSE':
        return 'House';
      case 'LAND':
        return 'Land';
      case 'COMMERCIAL':
        return 'Commercial';
      default:
        return type || 'Unknown';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'SHORT_STAY':
        return 'Short Stay';
      case 'LONG_TERM_RENTAL':
        return 'Long Term Rental';
      case 'LANDED_PROPERTY':
        return 'Landed Property';
      case 'PROPERTY_SALE':
        return 'Property Sale';
      default:
        return category || 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (property: any) => {
    const status = property.moderationStatus || 'PENDING';
    switch (status) {
      case 'APPROVED':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approved</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Rejected</span>;
      case 'PENDING':
      default:
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading properties: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600">Manage and approve property listings</p>
        </div>
        <Link
          href="/admin/properties/create"
          className="bg-[#7C0302] text-white px-4 py-2 rounded-md hover:bg-[#5a0201] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.moderationStatus === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.moderationStatus === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.moderationStatus === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C0302]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C0302]"
            >
              <option value="all">All Types</option>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property: any) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {property.images && property.images.length > 0 ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={property.images[0].url}
                            alt={property.title}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Home className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">
                          {property.city}, {property.state}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPropertyTypeColor(property.type)}`}>
                            {getPropertyTypeIcon(property.type)}
                            <span className="ml-1">{getPropertyTypeLabel(property.type)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.owner?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{property.owner?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(property.price, property.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(property)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(property.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="text-[#7C0302] hover:text-[#5a0201]"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {property.moderationStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(property.id)}
                            disabled={approvingId === property.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(property.id)}
                            disabled={rejectingId === property.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 