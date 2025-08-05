'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Eye, Edit, CheckCircle, XCircle, Plus, Search, Filter, Bug, Database } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
});

export default function AdminPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [propertiesTestInfo, setPropertiesTestInfo] = useState<any>(null);

  // Add cache-busting parameter
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/properties?t=${Date.now()}`, fetcher);

  // Force refresh on mount
  useEffect(() => {
    mutate();
  }, [mutate]);

  // Debug logging
  useEffect(() => {
    console.log('Admin properties page - Data:', data);
    console.log('Admin properties page - Error:', error);
    console.log('Admin properties page - Loading:', isLoading);
  }, [data, error, isLoading]);

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/admin/test');
      const result = await response.json();
      setDebugInfo(result);
      console.log('Debug API result:', result);
    } catch (error) {
      console.error('Debug API error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testPropertiesData = async () => {
    try {
      const response = await fetch('/api/admin/test-properties');
      const result = await response.json();
      setPropertiesTestInfo(result);
      console.log('Properties test result:', result);
    } catch (error) {
      console.error('Properties test error:', error);
      setPropertiesTestInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleApprove = async (propertyId: string) => {
    if (!confirm('Are you sure you want to approve this property?')) return;
    setApprovingId(propertyId);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Approved by admin', featured: false }),
      });
      if (response.ok) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reason }),
      });
      if (response.ok) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'HOUSE':
        return <span className="text-green-600">🏠</span>;
      case 'APARTMENT':
        return <span className="text-blue-600">🏢</span>;
      case 'CONDO':
        return <span className="text-purple-600">🏘️</span>;
      case 'TOWNHOUSE':
        return <span className="text-orange-600">🏡</span>;
      case 'LAND':
        return <span className="text-brown-600">🌾</span>;
      case 'COMMERCIAL':
        return <span className="text-gray-600">🏪</span>;
      default:
        return <span className="text-gray-600">🏠</span>;
    }
  };

  if (isLoading) return (
    <div className="p-6">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2">Loading properties...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Error loading properties</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
        <div className="mt-4 space-x-2">
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
          <button
            onClick={testApiConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug API
          </button>
          <button
            onClick={testPropertiesData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Database className="w-4 h-4 mr-2" />
            Test Properties
          </button>
        </div>
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        {propertiesTestInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <h4 className="font-medium mb-2">Properties Test Info:</h4>
            <pre>{JSON.stringify(propertiesTestInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-yellow-800 font-medium">No data received</h3>
        <p className="text-yellow-600 mt-1">The API returned no data. Please check the console for more details.</p>
        <div className="mt-4 space-x-2">
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Retry
          </button>
          <button
            onClick={testApiConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug API
          </button>
          <button
            onClick={testPropertiesData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Database className="w-4 h-4 mr-2" />
            Test Properties
          </button>
        </div>
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        {propertiesTestInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <h4 className="font-medium mb-2">Properties Test Info:</h4>
            <pre>{JSON.stringify(propertiesTestInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );

  const filteredProperties = data.properties?.filter((property: any) => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = propertyType === 'all' || property.type === propertyType;
    return matchesSearch && matchesType;
  }) || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
          <p className="text-gray-600">Manage and approve property listings</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={testApiConnection}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
          >
            <Bug className="w-4 h-4 mr-1" />
            Debug
          </button>
          <button
            onClick={testPropertiesData}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
          >
            <Database className="w-4 h-4 mr-1" />
            Test Props
          </button>
          <Link
            href="/admin/properties/create"
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Property
          </Link>
        </div>
      </div>

      {debugInfo && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      {propertiesTestInfo && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <h4 className="font-medium mb-2">Properties Test Info:</h4>
          <pre>{JSON.stringify(propertiesTestInfo, null, 2)}</pre>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600">🏠</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{data.properties?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.properties?.filter((p: any) => p.moderationStatus === 'PENDING').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.properties?.filter((p: any) => p.moderationStatus === 'APPROVED').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.properties?.filter((p: any) => p.moderationStatus === 'REJECTED').length || 0}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Types</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
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
              {filteredProperties.map((property: any) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          {getPropertyTypeIcon(property.type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.description}
                        </div>
                        <div className="text-xs text-gray-400">
                          {property.location?.city}, {property.location?.state}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {property.owner?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.owner?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ₦{property.price?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(property.moderationStatus)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Property"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/properties/${property.id}/edit`}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Edit Property"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleApprove(property.id)}
                        disabled={approvingId === property.id}
                        className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                        title="Approve Property"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(property.id)}
                        disabled={rejectingId === property.id}
                        className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                        title="Reject Property"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No properties found</p>
          </div>
        )}
      </div>
    </div>
  );
} 