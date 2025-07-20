'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';

interface Inquiry {
  id: string;
  message: string;
  inquiryType: string;
  contactPreference: string;
  intendedUse: string | null;
  budget: number | null;
  timeframe: string | null;
  financingNeeded: boolean;
  status: string;
  inquirerName: string | null;
  inquirerEmail: string | null;
  inquirerPhone: string | null;
  preferredContactMethod: string | null;
  requestViewing: boolean;
  viewingDate: string | null;
  viewingTime: string | null;
  virtualViewingInterest: boolean;
  createdAt: string;
  property: {
    id: string;
    title: string;
    location: string;
    city: string;
    state: string;
    price: number;
    currency: string;
    images: Array<{ url: string }>;
  };
  conversation?: {
    id: string;
    messages: Array<{ content: string; createdAt: string }>;
  };
}

interface InquirySummary {
  total: number;
  new: number;
  responded: number;
  inProgress: number;
  closed: number;
  spam: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function InquiriesPage() {
  const { data: session, status } = useSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [summary, setSummary] = useState<InquirySummary>({
    total: 0,
    new: 0,
    responded: 0,
    inProgress: 0,
    closed: 0,
    spam: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    inquiryType: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedInquiries, setSelectedInquiries] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInquiries();
    }
  }, [status, filters, pagination.page]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Add pagination
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/inquiries?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setInquiries(data.data);
        setSummary(data.summary);
        setPagination(data.pagination);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch inquiries');
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedInquiries.length === 0) return;

    try {
      const response = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryIds: selectedInquiries,
          status: bulkAction,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedInquiries([]);
        setBulkAction('');
        fetchInquiries();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update inquiries');
      console.error('Error updating inquiries:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'RESPONDED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'SPAM': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (status === 'loading') {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="text-center py-10 text-[#7C0302]">You must be signed in to view your inquiries.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inquiry Management</h1>
        <p className="text-gray-600 mt-1">
          Manage and respond to property inquiries from potential buyers and renters.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          <div className="text-sm text-gray-600">Total Inquiries</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-blue-600">{summary.new}</div>
          <div className="text-sm text-blue-600">New</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-green-600">{summary.responded}</div>
          <div className="text-sm text-green-600">Responded</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-yellow-600">{summary.inProgress}</div>
          <div className="text-sm text-yellow-600">In Progress</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-gray-600">{summary.closed}</div>
          <div className="text-sm text-gray-600">Closed</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-red-600">{summary.spam}</div>
          <div className="text-sm text-red-600">Spam</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="RESPONDED">Responded</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
              <option value="SPAM">Spam</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type</label>
            <select
              value={filters.inquiryType}
              onChange={(e) => handleFilterChange({ inquiryType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Types</option>
              <option value="GENERAL_INFO">General Information</option>
              <option value="VIEWING_REQUEST">Viewing Request</option>
              <option value="PRICE_INQUIRY">Price Inquiry</option>
              <option value="PURCHASE_INTENT">Purchase Intent</option>
              <option value="RENTAL_APPLICATION">Rental Application</option>
              <option value="INVESTMENT_INQUIRY">Investment Inquiry</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="createdAt">Date</option>
              <option value="status">Status</option>
              <option value="inquiryType">Type</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <button
            onClick={() => {
              setFilters({
                status: 'all',
                inquiryType: '',
                dateFrom: '',
                dateTo: '',
                sortBy: 'createdAt',
                sortOrder: 'desc',
              });
            }}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedInquiries.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">
              {selectedInquiries.length} inquiry{selectedInquiries.length !== 1 ? 'ies' : 'y'} selected
            </span>
            <div className="flex gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Action</option>
                <option value="RESPONDED">Mark as Responded</option>
                <option value="IN_PROGRESS">Mark as In Progress</option>
                <option value="CLOSED">Mark as Closed</option>
                <option value="SPAM">Mark as Spam</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedInquiries([])}
                className="px-4 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inquiries...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchInquiries}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
                            <p className="text-gray-600">You haven&apos;t received any inquiries yet, or no inquiries match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedInquiries.length === inquiries.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInquiries(inquiries.map(i => i.id));
                        } else {
                          setSelectedInquiries([]);
                        }
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inquirer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInquiries.includes(inquiry.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInquiries(prev => [...prev, inquiry.id]);
                          } else {
                            setSelectedInquiries(prev => prev.filter(id => id !== inquiry.id));
                          }
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {inquiry.property.images[0] ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={inquiry.property.images[0].url}
                              alt={inquiry.property.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {inquiry.property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {inquiry.property.city}, {inquiry.property.state}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPrice(inquiry.property.price, inquiry.property.currency)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inquiry.inquirerName}</div>
                      <div className="text-sm text-gray-500">{inquiry.inquirerEmail}</div>
                      <div className="text-sm text-gray-500">{inquiry.inquirerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getInquiryTypeLabel(inquiry.inquiryType)}
                      </div>
                      {inquiry.requestViewing && (
                        <div className="text-xs text-blue-600">Viewing Requested</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // TODO: Open inquiry detail modal
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Open response modal
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Respond
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 