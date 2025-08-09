import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const propertyId = params.id;
    
    // Get current property status
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, isFeatured: true, title: true }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Toggle featured status
    const newFeaturedStatus = !property.isFeatured;
    
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { isFeatured: newFeaturedStatus },
      select: { 
        id: true, 
        isFeatured: true, 
        title: true,
        moderationStatus: true 
      }
    });

    console.log(`Property ${propertyId} featured status changed to:`, newFeaturedStatus);

    return NextResponse.json({
      success: true,
      message: `Property ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully`,
      property: updatedProperty
    });

  } catch (error) {
    console.error('Error toggling property featured status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
