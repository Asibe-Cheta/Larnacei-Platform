'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Home,
  Users,
  Shield,
  BarChart3,
  Settings,
  FileText,
  DollarSign,
  AlertTriangle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is authenticated (removed admin check for development)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.href));
    }
  }, [session, status, router]);

  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Platform overview and quick stats'
    },
    {
      name: 'Admin Properties',
      href: '/admin/properties',
      icon: Home,
      description: 'Create and manage admin properties'
    },
    {
      name: 'Property Moderation',
      href: '/admin/moderation',
      icon: Shield,
      description: 'Review and approve property listings'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      description: 'Manage user accounts and KYC'
    },
    {
      name: 'Content Review',
      href: '/admin/moderation',
      icon: FileText,
      description: 'Moderate images and content'
    },
    {
      name: 'Financial Management',
      href: '/admin/financial',
      icon: DollarSign,
      description: 'Revenue tracking and payments'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Business intelligence and reports'
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Platform configuration'
    }
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect to signin
  }

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
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ width: 240, minWidth: 220, maxWidth: 240, padding: 16 }}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-200" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Link href="/admin" className="flex items-center space-x-2">
            <Image
              src="/images/Larnacei_coloured.png"
              alt="Larnacei Admin"
              width={32}
              height={32}
              className="h-8"
            />
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
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
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center h-11 px-4 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  style={{ marginBottom: 8, height: 44, padding: '8px 16px' }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon style={{ width: 20, height: 20, marginRight: 12 }} />
                  <span className="truncate lg:block hidden">{item.name}</span>
                  <span className="truncate block lg:hidden sr-only">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-red-700">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: 240 }}>
        {/* Top bar (inside main content) */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Admin Panel</span>
                <span>•</span>
                <span>Larnacei Platform</span>
              </div>
              {/* Quick stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">12 Pending</span>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">₦2.4M Revenue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1 w-full p-6" style={{ maxWidth: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
} 