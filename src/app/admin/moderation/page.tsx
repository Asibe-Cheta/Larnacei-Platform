'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'property' | 'user' | 'review' | 'inquiry';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export default function AdminModerationPage() {
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/moderation');
      if (!response.ok) {
        throw new Error('Failed to fetch moderation data');
      }
      const data = await response.json();
      setModerationItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/${itemId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        // Refresh the data
        fetchModerationData();
      }
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/${itemId}/reject`, {
        method: 'POST',
      });
      if (response.ok) {
        // Refresh the data
        fetchModerationData();
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Eye className="w-4 h-4" />;
      case 'user':
        return <AlertTriangle className="w-4 h-4" />;
      case 'review':
        return <CheckCircle className="w-4 h-4" />;
      case 'inquiry':
        return <Clock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredItems = moderationItems.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Moderation</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-2">Review and moderate user-submitted content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationItems.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationItems.filter(item => item.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationItems.filter(item => item.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationItems.filter(item => item.priority === 'high').length}
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
                    placeholder="Search moderation items..."
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
                  <option value="all">All Items</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Moderation Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Item Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Item Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">Submitted by:</span>
                    <span className="ml-2">{item.submittedBy}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">Submitted:</span>
                    <span className="ml-2">{formatDate(item.submittedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                {item.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-1 inline" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1 inline" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No moderation items available.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 