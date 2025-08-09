import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true }
  });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // Get properties
  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      isActive: true,
      viewCount: true,
      moderationStatus: true
    }
  });

  const myProperties = properties.length;
  // Active listings are properties that are active AND approved
  const activeListings = properties.filter((p: { isActive: boolean; moderationStatus: string }) => 
    p.isActive && p.moderationStatus === 'APPROVED'
  ).length;
  const totalViews = properties.reduce((sum: number, p: { viewCount?: number }) => sum + (p.viewCount || 0), 0);

  // Get inquiries for user's properties
  const propertyIds = properties.map((p: { id: string }) => p.id);
  const inquiries = propertyIds.length > 0
    ? await prisma.propertyInquiry.count({ where: { propertyId: { in: propertyIds } } })
    : 0;

  // Debug logging
  console.log('User dashboard stats:', {
    userId: user.id,
    totalProperties: properties.length,
    myProperties,
    activeListings,
    totalViews,
    inquiries,
    propertiesData: properties.map(p => ({ 
      id: p.id, 
      isActive: p.isActive, 
      moderationStatus: p.moderationStatus 
    }))
  });

  return NextResponse.json({
    name: user.name,
    myProperties,
    activeListings,
    totalViews,
    inquiries
  });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 