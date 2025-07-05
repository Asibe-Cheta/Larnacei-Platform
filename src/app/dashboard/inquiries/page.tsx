import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import React from 'react';

export default async function InquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return <div className="text-center py-10 text-[#7C0302]">You must be signed in to view your inquiries.</div>;
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return <div className="text-center py-10 text-[#7C0302]">User not found.</div>;
  }
  // Get all property IDs owned by the user
  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    select: { id: true, title: true },
  });
  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p.title]));
  const propertyIds = properties.map((p) => p.id);
  // Fetch inquiries for these properties
  const inquiries = await prisma.propertyInquiry.findMany({
    where: { propertyId: { in: propertyIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      inquirer: { select: { name: true, email: true } },
      property: { select: { title: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#7C0302' }}>Inquiries</h2>
      {inquiries.length === 0 ? (
        <div className="text-center text-gray-500">No inquiries for your properties yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr style={{ background: '#7C0302', color: 'white' }}>
                <th className="py-2 px-3 text-left">Property</th>
                <th className="py-2 px-3 text-left">Inquirer</th>
                <th className="py-2 px-3 text-left">Message</th>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{inq.property?.title || propertyMap[inq.propertyId] || '—'}</td>
                  <td className="py-2 px-3">{inq.inquirer?.name || 'Unknown'}<br /><span className="text-xs text-gray-500">{inq.inquirer?.email}</span></td>
                  <td className="py-2 px-3 max-w-xs truncate">{inq.message.slice(0, 60)}{inq.message.length > 60 ? '...' : ''}</td>
                  <td className="py-2 px-3">{new Date(inq.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-1 rounded ${inq.status === 'NEW' ? 'bg-yellow-100 text-yellow-700' : inq.status === 'RESPONDED' ? 'bg-green-100 text-green-700' : inq.status === 'CLOSED' ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-700'}`}>
                      {inq.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <Link href={`/dashboard/inquiries/${inq.id}`} className="btn btn-xs" style={{ background: '#7C0302', color: 'white' }}>View</Link>
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