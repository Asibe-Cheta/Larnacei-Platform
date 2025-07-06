'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandedPropertiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main properties page with landed properties category filter
    router.replace('/properties?category=LANDED_PROPERTY');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to landed properties...</p>
      </div>
    </div>
  );
} 