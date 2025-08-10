import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Admin property detail GET: Starting request for ID:', params.id);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Admin property detail GET: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Admin property detail GET: Session found for user:', session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      console.log('Admin property detail GET: User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Admin property detail GET: User found with role:', user.role);

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Admin property detail GET: User does not have admin access');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('Admin property detail GET: Querying database for property with ID:', params.id);

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            accountType: true,
            isVerified: true,
            verificationLevel: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!property) {
      console.log('Admin property detail GET: Property not found in database for ID:', params.id);
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    console.log('Admin property detail GET: Property found:', property.id, property.title);
    console.log('Admin property detail GET: Property status:', { isActive: property.isActive, moderationStatus: property.moderationStatus });

    // Serialize BigInt fields for JSON response
    const serializedProperty = serializeBigInt(property);

    return NextResponse.json({
      success: true,
      property: serializedProperty,
    });
  } catch (error: any) {
    console.error('Admin property detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
