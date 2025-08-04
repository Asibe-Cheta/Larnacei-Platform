'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Building,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  X,
  Menu
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return;
      }

      if (session?.user?.email) {
        try {
          const response = await fetch('/api/admin/debug-user');
          const data = await response.json();

          if (data.isAdmin) {
            setIsAdmin(true);
          } else {
            // User is not admin, redirect to dashboard
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error checking admin access:', error);
          router.push('/dashboard');
          return;
        }
      }

      setIsLoading(false);
    };

    checkAdminAccess();
  }, [session, status, router]);

  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      name: 'Properties',
      href: '/admin/properties',
      icon: Building,
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

  if (status === 'loading' || isLoading) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
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
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
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
              <span className="text-sm text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</span>
              <Link
                href="/dashboard"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Exit Admin
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 