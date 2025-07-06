'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Home,
  MapPin,
  Calendar,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    byCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    byLocation: Array<{
      location: string;
      amount: number;
      percentage: number;
    }>;
  };
  users: {
    total: number;
    newThisMonth: number;
    growth: number;
    byType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    byLocation: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
  };
  properties: {
    total: number;
    active: number;
    pending: number;
    byCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    byLocation: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
  };
  bookings: {
    total: number;
    thisMonth: number;
    growth: number;
    conversionRate: number;
    averageValue: number;
  };
  performance: {
    pageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data, isLoading, error } = useSWR(`/api/admin/analytics?timeRange=${timeRange}`, fetcher);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="mt-2 text-red-600">Error loading analytics data.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
        <p className="mt-1 text-sm text-gray-500">Analytics data will appear here once available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue.total)}</p>
              <div className={`flex items-center mt-1 ${getGrowthColor(data.revenue.growth)}`}>
                {getGrowthIcon(data.revenue.growth)}
                <span className="text-sm font-medium ml-1">
                  {Math.abs(data.revenue.growth).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.users.total)}</p>
              <div className={`flex items-center mt-1 ${getGrowthColor(data.users.growth)}`}>
                {getGrowthIcon(data.users.growth)}
                <span className="text-sm font-medium ml-1">
                  {Math.abs(data.users.growth).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.properties.total)}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span className="text-green-600 font-medium">{data.properties.active}</span>
                <span className="mx-1">active,</span>
                <span className="text-yellow-600 font-medium">{data.properties.pending}</span>
                <span className="ml-1">pending</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.bookings.total)}</p>
              <div className={`flex items-center mt-1 ${getGrowthColor(data.bookings.growth)}`}>
                {getGrowthIcon(data.bookings.growth)}
                <span className="text-sm font-medium ml-1">
                  {Math.abs(data.bookings.growth).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="space-y-4">
            {data.revenue.byCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Type */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Type</h3>
          <div className="space-y-4">
            {data.users.byType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{item.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(item.count)}</p>
                  <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by Category</h3>
          <div className="space-y-4">
            {data.properties.byCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(item.count)}</p>
                  <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Page Views</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{formatNumber(data.performance.pageViews)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Unique Visitors</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{formatNumber(data.performance.uniqueVisitors)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Avg. Session Duration</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{data.performance.averageSessionDuration.toFixed(1)}m</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Bounce Rate</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{data.performance.bounceRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{data.bookings.conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Conversion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.bookings.averageValue)}</p>
              <p className="text-sm text-gray-500">Avg. Booking Value</p>
            </div>
          </div>
        </div>

        {/* Revenue by Location */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Locations</h3>
          <div className="space-y-3">
            {data.revenue.byLocation.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{item.location}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 