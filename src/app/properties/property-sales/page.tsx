'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PropertySalesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main properties page with property sales category filter
    router.replace('/properties?category=PROPERTY_SALE');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to property sales...</p>
      </div>
    </div>
  );
} 