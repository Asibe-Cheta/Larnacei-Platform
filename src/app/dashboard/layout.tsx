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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">U</span>
                  </div>
                  <span className="hidden md:block">User</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5 mr-3" />
                Overview
              </Link>
              <Link
                href="/dashboard/properties"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.startsWith('/dashboard/properties')
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5 mr-3" />
                My Properties
              </Link>
              <Link
                href="/dashboard/inquiries"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.startsWith('/dashboard/inquiries')
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                Inquiries
              </Link>
              <Link
                href="/dashboard/analytics"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.startsWith('/dashboard/analytics')
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart2 className="w-5 h-5 mr-3" />
                Analytics
              </Link>
              <Link
                href="/dashboard/payments"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.startsWith('/dashboard/payments')
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                Payments
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.startsWith('/dashboard/settings')
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 