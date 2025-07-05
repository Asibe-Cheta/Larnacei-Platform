import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import PropertiesGrid from './PropertiesGrid';
import React from 'react';

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return <div className="text-center py-10 text-[#7C0302]">You must be signed in to view your properties.</div>;
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
      price: true,
      currency: true,
      isActive: true,
      isVerified: true,
      isFeatured: true,
      moderationStatus: true,
      images: { select: { url: true, isPrimary: true } },
      location: true,
      state: true,
      city: true,
      lga: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#7C0302' }}>My Properties</h2>
      <PropertiesGrid properties={properties} />
    </div>
  );
} 