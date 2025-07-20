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
  MapPin
} from 'lucide-react';


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPropertiesPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Build query params
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filter && filter !== 'all') {
    params.append('type', filter);
  }
  params.append('page', String(page));
  params.append('limit', String(limit));

  const { data, isLoading, error } = useSWR(`/api/admin/properties?${params.toString()}`, fetcher);
  const properties = data?.properties || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'demo':
        return <Home className="w-4 h-4" />;
      case 'featured':
        return <Star className="w-4 h-4" />;
      case 'partner':
        return <Building className="w-4 h-4" />;
      case 'showcase':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'demo':
        return 'bg-blue-100 text-blue-800';
      case 'featured':
        return 'bg-yellow-100 text-yellow-800';
      case 'partner':
        return 'bg-purple-100 text-purple-800';
      case 'showcase':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'demo':
        return 'Demo';
      case 'featured':
        return 'Featured';
      case 'partner':
        return 'Partner';
      case 'showcase':
        return 'Showcase';
      default:
        return 'Regular';
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
        return 'Long-term Rental';
      case 'PROPERTY_SALE':
        return 'Property Sale';
      case 'LANDED_PROPERTY':
        return 'Landed Property';
      default:
        return category;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch(`/api/admin/properties/${propertyId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Refresh the data
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting property:', error);
      }
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
            <p className="text-gray-600 mt-2">Manage all properties on the platform</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/admin/properties/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.isFeatured).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => !p.isApproved).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
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
                  <option value="all">All Types</option>
                  <option value="demo">Demo</option>
                  <option value="featured">Featured</option>
                  <option value="partner">Partner</option>
                  <option value="showcase">Showcase</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Home className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPropertyTypeColor(property.type)}`}>
                    {getPropertyTypeLabel(property.type)}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  {getPropertyTypeIcon(property.type)}
                </div>
              </div>

              {/* Property Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {property.isActive && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {!property.isApproved && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.city}, {property.state}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(property.price, property.currency)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getCategoryLabel(property.category)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{property.viewCount} views</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    <span>{property.inquiryCount} inquiries</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/properties/${property.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/properties/${property.id}/edit`}
                      className="p-2 text-blue-400 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(property.createdAt)}
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