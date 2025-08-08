"use client";

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Grid, Home, MessageSquare, BarChart2, Settings, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'overview', label: 'Overview', icon: Grid, href: '/dashboard/overview' },
    { id: 'properties', label: 'My Properties', icon: Home, href: '/dashboard/properties' },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, href: '/dashboard/inquiries' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, href: '/dashboard/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 240, minWidth: 220, maxWidth: 240, padding: 16 }}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-200" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/Larnacei_coloured.png"
              alt="Larnacei Global Limited Logo"
              width={32}
              height={32}
              className="h-8"
            />
            <span className="text-xl font-bold text-gray-900">Dashboard</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6">
          <div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.id === 'overview' && pathname === '/dashboard');
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center h-11 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={{ marginBottom: 8, height: 44, padding: '8px 16px' }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, User</span>
              <Link
                href="/"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 