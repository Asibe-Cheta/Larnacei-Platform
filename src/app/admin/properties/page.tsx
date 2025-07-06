'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { 
  Plus, 
  Home, 
  Star, 
  Building, 
  Users, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  TrendingUp
} from 'lucide-react';

interface AdminProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  category: string;
  type: 'demo' | 'featured' | 'partner' | 'showcase';
  status: 'active' | 'inactive' | 'draft';
  views: number;
  inquiries: number;
  bookings: number;
  createdAt: string;
  updatedAt: string;
  image?: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  isVerified: boolean;
  isApproved: boolean;
  isActive: boolean;
}

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
          <p className="mt-2 text-gray-600">Loading admin properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="mt-2 text-red-600">Error loading properties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Properties</h1>
          <p className="mt-1 text-gray-600">
            Create and manage platform properties, demos, and featured listings
          </p>
        </div>
        <Link
          href="/admin/properties/create"
          className="inline-flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Property
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.type === 'featured').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Partner</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.type === 'partner').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Showcase</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.filter(p => p.type === 'showcase').length}
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
                placeholder="Search properties..."
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
              <option value="all">All Types</option>
              <option value="demo">Demo</option>
              <option value="featured">Featured</option>
              <option value="partner">Partner</option>
              <option value="showcase">Showcase</option>
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
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
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
              {properties.map((property: AdminProperty) => (
                <tr key={property.id} className="hover:bg-gray-50">
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
                          {getCategoryLabel(property.category)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPropertyTypeColor(property.type)}`}>
                      {getPropertyTypeIcon(property.type)}
                      <span className="ml-1 capitalize">{property.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.price, property.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{property.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{property.inquiries} inquiries</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        <span>{property.bookings} bookings</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.owner.name}</div>
                    <div className="text-sm text-gray-500">{property.owner.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(property.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-red-600 hover:text-red-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
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
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new admin property.
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