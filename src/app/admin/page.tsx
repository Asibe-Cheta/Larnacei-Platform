'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  BarChart3
} from 'lucide-react';
import useSWR from 'swr';

interface DashboardStats {
  pendingProperties: number;
  newUsers: number;
  totalRevenue: number;
  activeListings: number;
  unresolvedReports: number;
  pendingKYC: number;
}

interface RecentActivity {
  id: string;
  type: 'property_submitted' | 'user_registered' | 'payment_received' | 'report_filed' | 'kyc_submitted';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'approved' | 'rejected';
  amount?: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useSWR('/api/admin/dashboard-stats', fetcher);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property_submitted':
        return <Home className="w-4 h-4" />;
      case 'user_registered':
        return <Users className="w-4 h-4" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4" />;
      case 'report_filed':
        return <AlertTriangle className="w-4 h-4" />;
      case 'kyc_submitted':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="mt-2 text-red-600">Error loading dashboard stats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back! Here's what's happening with the Larnacei platform today.
        </p>
      </div>

      {/* Quick Stats (Real Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingProperties}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Users (7 days)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newUsers}</p>
              {/* You can add weekly growth here if you fetch it from the API */}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue (Month)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              <p className="text-xs text-gray-500 mt-1">Approved properties</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unresolved Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unresolvedReports}</p>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending KYC</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingKYC}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-red-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Review Properties</p>
              <p className="text-sm text-gray-500">{stats.pendingProperties} pending</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Process KYC</p>
              <p className="text-sm text-gray-500">{stats.pendingKYC} pending</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Handle Reports</p>
              <p className="text-sm text-gray-500">{stats.unresolvedReports} unresolved</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-5 h-5 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-500">Financial analytics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            View all
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Recent activity data would be fetched and displayed here */}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(2200000)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Growth</span>
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="font-medium">+9.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="text-lg font-bold text-gray-900">2,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Properties Listed</span>
              <span className="text-lg font-bold text-gray-900">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Successful Bookings</span>
              <span className="text-lg font-bold text-gray-900">892</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Rating</span>
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-900">4.8</span>
                <span className="text-yellow-400 ml-1">★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 