import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import React from 'react';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return <div className="text-center py-10 text-[#7C0302]">You must be signed in to view analytics.</div>;
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return <div className="text-center py-10 text-[#7C0302]">User not found.</div>;
  }
  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      viewCount: true,
      inquiryCount: true,
      favoriteCount: true,
      isActive: true,
      isVerified: true,
      moderationStatus: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#7C0302' }}>Analytics</h2>
      {properties.length === 0 ? (
        <div className="text-center text-gray-500">No properties to show analytics for.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr style={{ background: '#7C0302', color: 'white' }}>
                <th className="py-2 px-3 text-left">Property</th>
                <th className="py-2 px-3 text-left">Views</th>
                <th className="py-2 px-3 text-left">Inquiries</th>
                <th className="py-2 px-3 text-left">Favorites</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">
                    <Link href={`/properties/${p.id}`} className="underline text-[#7C0302]">{p.title}</Link>
                  </td>
                  <td className="py-2 px-3">{p.viewCount}</td>
                  <td className="py-2 px-3">{p.inquiryCount}</td>
                  <td className="py-2 px-3">{p.favoriteCount}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-1 rounded ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${p.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{p.isVerified ? 'Verified' : 'Unverified'}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${p.moderationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : p.moderationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.moderationStatus}</span>
                  </td>
                  <td className="py-2 px-3">
                    <Link href={`/dashboard/properties/${p.id}/edit`} className="btn btn-xs border border-[#7C0302] text-[#7C0302] bg-white">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 