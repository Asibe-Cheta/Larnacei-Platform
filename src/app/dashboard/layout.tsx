"use client";
import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Grid, Home, MessageSquare, BarChart2, Settings, CreditCard } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
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
                    <span className="text-sm font-medium">U</span>
                  </div>
                  <span className="hidden md:block">User</span>
                  <span className="material-icons text-sm">arrow_drop_down</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-gray-100 border-b border-gray-200 mb-8">
          <nav className="flex flex-row items-center gap-x-8 px-6" style={{ minHeight: 56 }}>
            {[
              { id: 'overview', label: 'Overview', icon: Grid, href: '/dashboard/overview' },
              { id: 'properties', label: 'My Properties', icon: Home, href: '/dashboard/properties' },
              { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, href: '/dashboard/inquiries' },
              { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
              { id: 'payments', label: 'Payments', icon: CreditCard, href: '/dashboard/payments' },
              { id: 'analytics', label: 'Analytics', icon: BarChart2, href: '/dashboard/analytics' },
              { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' }
            ].map((tab) => {
              const isActive = pathname === tab.href || (tab.id === 'overview' && pathname === '/dashboard');
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative flex items-center gap-2 px-3 py-3 transition-colors duration-150
                    ${isActive
                      ? 'text-red-700 font-bold'
                      : 'text-gray-500 hover:text-red-600'}
                  `}
                  style={{ fontSize: isActive ? 18 : 16 }}
                >
                  <Icon size={22} className={isActive ? 'text-red-600' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-1 rounded bg-red-600" style={{ width: '90%', margin: '0 auto' }} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Render the current tab's content via nested routes */}
        <div className="py-8">
          {children}
        </div>
      </div>
    </div>
  );
} 