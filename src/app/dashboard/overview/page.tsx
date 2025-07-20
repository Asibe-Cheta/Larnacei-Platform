import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

import React from 'react';

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return <div className="text-center py-10 text-[#7C0302]">You must be signed in to view your dashboard.</div>;
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return <div className="text-center py-10 text-[#7C0302]">User not found.</div>;
  }
  // Fetch properties and stats
  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    select: { id: true, isActive: true, viewCount: true },
  });
  const myProperties = properties.length;
  const activeListings = properties.filter((p) => p.isActive).length;
  const totalViews = properties.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const propertyIds = properties.map((p) => p.id);
  const inquiries = propertyIds.length > 0
    ? await prisma.propertyInquiry.count({ where: { propertyId: { in: propertyIds } } })
    : 0;
  const stats = [
    { label: 'My Properties', value: myProperties, icon: 'home' },
    { label: 'Active Listings', value: activeListings, icon: 'list' },
    { label: 'Total Views', value: totalViews, icon: 'visibility' },
    { label: 'Inquiries', value: inquiries, icon: 'message' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#7C0302' }}>Overview</h2>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 primary-bg rounded-md flex items-center justify-center" style={{ background: '#7C0302' }}>
                  <span className="material-icons text-white text-sm">{stat.icon}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/list-property"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3" style={{ background: '#7C0302', color: 'white' }}>
                  <span className="material-icons">add</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  List New Property
                </h3>
                <p className="mt-2 text-sm text-gray-500">Add a new property to your portfolio</p>
              </div>
            </Link>
            <Link
              href="/dashboard/properties"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                  <span className="material-icons">edit</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Properties
                </h3>
                <p className="mt-2 text-sm text-gray-500">Edit and update your listings</p>
              </div>
            </Link>
            <Link
              href="/dashboard/inquiries"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                  <span className="material-icons">message</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Inquiries
                </h3>
                <p className="mt-2 text-sm text-gray-500">Respond to potential buyers</p>
              </div>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                  <span className="material-icons">bar_chart</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Analytics
                </h3>
                <p className="mt-2 text-sm text-gray-500">Track your property performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 