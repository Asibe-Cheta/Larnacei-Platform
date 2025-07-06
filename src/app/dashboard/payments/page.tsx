'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { formatAmountForDisplay } from '@/lib/paystack-service';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentType: string;
  status: string;
  paystackReference: string;
  paidAt: string | null;
  createdAt: string;
  refundAmount: number;
  refundedAt: string | null;
  booking?: {
    id: string;
    checkIn: string;
    checkOut: string;
    totalNights: number;
    property: {
      id: string;
      title: string;
      location: string;
      image?: string;
    };
  } | null;
  premiumFeature?: {
    id: string;
    name: string;
    featureType: string;
  } | null;
}

interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  totalRefunds: number;
  netAmount: number;
}

interface MonthlyEarning {
  currency: string;
  total: number;
}

export default function PaymentsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    paymentType: '',
    currency: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch payment data
  const fetchPayments = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/payments/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setSummary(data.summary);
        setMonthlyEarnings(data.monthlyEarnings);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayments();
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchPayments(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'BOOKING_PAYMENT':
        return 'Booking Payment';
      case 'SECURITY_DEPOSIT':
        return 'Security Deposit';
      case 'CLEANING_FEE':
        return 'Cleaning Fee';
      case 'SERVICE_FEE':
        return 'Service Fee';
      case 'PREMIUM_FEATURE':
        return 'Premium Feature';
      case 'SUBSCRIPTION':
        return 'Subscription';
      case 'REFUND':
        return 'Refund';
      default:
        return type;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD':
        return '💳';
      case 'BANK_TRANSFER':
        return '🏦';
      case 'USSD':
        return '📱';
      case 'MOBILE_MONEY':
        return '📲';
      case 'WALLET':
        return '👛';
      default:
        return '💰';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your payments, track earnings, and view transaction history</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmountForDisplay(summary.totalAmount, 'NGN')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalPayments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmountForDisplay(summary.totalRefunds, 'NGN')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmountForDisplay(summary.netAmount, 'NGN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Earnings Chart */}
        {monthlyEarnings.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyEarnings.map((earning, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{earning.currency}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatAmountForDisplay(earning.total, earning.currency as any)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Transactions
            </h3>
            <button
              onClick={() => fetchPayments(1)}
              className="flex items-center text-sm text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <select
                value={filters.paymentType}
                onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Types</option>
                <option value="BOOKING_PAYMENT">Booking Payment</option>
                <option value="SECURITY_DEPOSIT">Security Deposit</option>
                <option value="PREMIUM_FEATURE">Premium Feature</option>
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="REFUND">Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={filters.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Currencies</option>
                <option value="NGN">Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPaymentTypeLabel(payment.paymentType)}
                          </div>
                          {payment.booking && (
                            <div className="text-sm text-gray-500">
                              {payment.booking.property.title}
                            </div>
                          )}
                          {payment.premiumFeature && (
                            <div className="text-sm text-gray-500">
                              {payment.premiumFeature.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmountForDisplay(payment.amount, payment.currency as any)}
                      </div>
                      {payment.refundAmount > 0 && (
                        <div className="text-sm text-red-600">
                          Refund: {formatAmountForDisplay(payment.refundAmount, payment.currency as any)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paystackReference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900 mr-3">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 