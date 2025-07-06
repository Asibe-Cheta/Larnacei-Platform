'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Shield,
  UserCheck,
  UserX,
  TrendingUp
} from 'lucide-react';
import useSWR from 'swr';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: 'individual' | 'agent' | 'agency';
  verificationStatus: 'verified' | 'pending' | 'unverified' | 'rejected';
  kycStatus: 'completed' | 'pending' | 'not_started' | 'rejected';
  registrationDate: string;
  lastActive: string;
  propertiesCount: number;
  totalRevenue: number;
  location: string;
  isSuspended: boolean;
  avatar?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UserManagementPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Build query params
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filter && filter !== 'all') {
    if (['verified', 'pending', 'unverified', 'rejected'].includes(filter)) {
      params.append('verificationStatus', filter);
    } else if (filter === 'agents') {
      params.append('accountType', 'agent'); // or handle both agent/agency as needed
    } else if (filter === 'suspended') {
      params.append('isSuspended', 'true'); // if supported in API
    }
  }
  params.append('page', String(page));
  params.append('limit', String(limit));

  const { data, isLoading, error } = useSWR(`/api/admin/users?${params.toString()}`, fetcher);
  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u: User) => u.id));
    }
  };

  const handleBulkAction = (action: 'verify' | 'suspend' | 'activate') => {
    // In a real app, you'd make API calls here
    console.log(`${action} users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unverified':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-purple-100 text-purple-800';
      case 'agency':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'individual':
        return 'Individual';
      case 'agent':
        return 'Agent';
      case 'agency':
        return 'Agency';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="mt-2 text-red-600">Error loading users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-gray-600">
          Manage user accounts, verify identities, and handle user issues
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending KYC</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.kycStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.verificationStatus === 'verified').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isSuspended).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified Users</option>
              <option value="pending">Pending Verification</option>
              <option value="unverified">Unverified Users</option>
              <option value="suspended">Suspended Users</option>
              <option value="agents">Agents & Agencies</option>
            </select>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('verify')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Selected ({selectedUsers.length})
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <UserX className="w-4 h-4 mr-2" />
                Suspend Selected ({selectedUsers.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-600">Select All</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  User
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  Account Type
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  Verification
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  Properties
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: User) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${user.isSuspended ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis align-middle" title={user.name}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-3"
                      />
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.avatar || '/images/placeholder.jpg'}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate" title={user.name}>
                          {user.name}
                          {user.isSuspended && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center truncate" title={user.email}>
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center truncate" title={user.phone}>
                          <Phone className="w-3 h-3 mr-1" />
                          {user.phone}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center truncate" title={user.location}>
                          <MapPin className="w-3 h-3 mr-1" />
                          {user.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis align-middle">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(user.accountType)}`}
                      title={getAccountTypeLabel(user.accountType)}>
                      {getAccountTypeLabel(user.accountType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis align-middle">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(user.verificationStatus)}`}
                      title={user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}>
                      {user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis align-middle">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKYCStatusColor(user.kycStatus)}`}
                      title={user.kycStatus.replace('_', ' ').charAt(0).toUpperCase() + user.kycStatus.replace('_', ' ').slice(1)}>
                      {user.kycStatus.replace('_', ' ').charAt(0).toUpperCase() + user.kycStatus.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis align-middle text-sm text-gray-900">
                    {user.propertiesCount} properties
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis align-middle text-sm font-medium text-gray-900" title={formatCurrency(user.totalRevenue)}>
                    {formatCurrency(user.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis align-middle text-sm text-gray-500">
                    <div className="flex items-center truncate">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {new Date(user.lastActive).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis align-middle text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No users registered yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
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
    </div>
  );
} 