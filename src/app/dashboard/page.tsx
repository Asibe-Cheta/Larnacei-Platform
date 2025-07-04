import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  let userName = '';
  let stats = [
    { label: 'My Properties', value: '-', change: '', changeType: 'neutral' },
    { label: 'Active Listings', value: '-', change: '', changeType: 'neutral' },
    { label: 'Total Views', value: '-', change: '', changeType: 'neutral' },
    { label: 'Inquiries', value: '-', change: '', changeType: 'neutral' }
  ];
  let error = '';

  if (!session || !session.user?.email) {
    error = 'You must be signed in to view your dashboard.';
  } else {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true }
    });
    if (!user) {
      error = 'User not found.';
    } else {
      userName = user.name || '';
      // Get properties
      const properties = await prisma.property.findMany({
        where: { ownerId: user.id },
        select: { id: true, isActive: true, viewCount: true }
      });
      const myProperties = properties.length;
      const activeListings = properties.filter((p: { isActive: boolean }) => p.isActive).length;
      const totalViews = properties.reduce((sum: number, p: { viewCount?: number }) => sum + (p.viewCount || 0), 0);
      // Get inquiries for user's properties
      const propertyIds = properties.map((p: { id: string }) => p.id);
      const inquiries = propertyIds.length > 0
        ? await prisma.propertyInquiry.count({ where: { propertyId: { in: propertyIds } } })
        : 0;
      stats = [
        { label: 'My Properties', value: myProperties, change: '', changeType: 'neutral' },
        { label: 'Active Listings', value: activeListings, change: '', changeType: 'neutral' },
        { label: 'Total Views', value: totalViews, change: '', changeType: 'neutral' },
        { label: 'Inquiries', value: inquiries, change: '', changeType: 'neutral' }
      ];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/Larnacei_coloured.png"
                  alt="Larnacei Global Limited Logo"
                  width={32}
                  height={32}
                  className="h-8"
                />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <span className="material-icons">notifications</span>
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}</span>
                  </div>
                  <span className="hidden md:block">{userName || 'User'}</span>
                  <span className="material-icons text-sm">arrow_drop_down</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard' },
              { id: 'properties', label: 'My Properties', icon: 'home' },
              { id: 'inquiries', label: 'Inquiries', icon: 'message' },
              { id: 'analytics', label: 'Analytics', icon: 'analytics' },
              { id: 'settings', label: 'Settings', icon: 'settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  tab.id === 'overview'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="material-icons text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Content */}
        <div className="space-y-8">
          {error ? (
            <div className="text-center py-10 text-[#7C0302]">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 primary-bg rounded-md flex items-center justify-center">
                          <span className="material-icons text-white text-sm">
                            {index === 0 ? 'home' : index === 1 ? 'list' : index === 2 ? 'visibility' : 'message'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.label}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/list-property"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 primary-bg text-white ring-4 ring-white">
                      <span className="material-icons">add</span>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      List New Property
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Add a new property to your portfolio
                    </p>
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
                    <p className="mt-2 text-sm text-gray-500">
                      Edit and update your listings
                    </p>
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
                    <p className="mt-2 text-sm text-gray-500">
                      Respond to potential buyers
                    </p>
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
                    <p className="mt-2 text-sm text-gray-500">
                      Track your property performance
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 