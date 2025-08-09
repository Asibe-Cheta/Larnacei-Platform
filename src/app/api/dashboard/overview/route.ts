import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Pass req and a dummy res to getServerSession for App Router API routes
    const session = await getServerSession(authOptions, req, {} as any);
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
  const activeListings = properties.filter((p: { isActive: boolean }) => p.isActive).length;
  const totalViews = properties.reduce((sum: number, p: { viewCount?: number }) => sum + (p.viewCount || 0), 0);

  // Get inquiries for user's properties
  const propertyIds = properties.map((p: { id: string }) => p.id);
  const inquiries = propertyIds.length > 0
    ? await prisma.propertyInquiry.count({ where: { propertyId: { in: propertyIds } } })
    : 0;

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