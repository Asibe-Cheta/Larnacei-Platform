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

    // Get recent properties for the user
    const recentProperties = await prisma.property.findMany({
      where: { ownerId: user.id },
      include: {
        images: {
          select: {
            url: true,
            isPrimary: true,
          },
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6, // Limit to 6 recent properties
    });

    // Transform the data to ensure proper structure
    const transformedProperties = recentProperties.map(property => ({
      ...property,
      images: property.images || []
    }));

    return NextResponse.json(transformedProperties);
  } catch (error) {
    console.error('Error fetching recent properties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
