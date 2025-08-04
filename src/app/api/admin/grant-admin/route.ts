import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetEmail, adminSecret } = body;

    // Simple admin secret check (in production, use proper authentication)
    if (adminSecret !== 'larnacei-admin-2024') {
      return NextResponse.json({ error: 'Invalid admin secret' }, { status: 403 });
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: {
        role: 'ADMIN',
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetEmail} has been granted admin access`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error granting admin access:', error);
    return NextResponse.json(
      { error: 'Failed to grant admin access' },
      { status: 500 }
    );
  }
} 