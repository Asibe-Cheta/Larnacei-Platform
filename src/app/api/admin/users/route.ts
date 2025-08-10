import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

// GET /api/admin/users - Get all users with admin information
export async function GET(req: NextRequest) {
  try {
    console.log('Admin users GET: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Admin users GET: Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Admin users GET: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      console.log('Admin users GET: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Admin users GET: User not admin:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const accountType = searchParams.get('accountType') || undefined;
    const verificationStatus = searchParams.get('verificationStatus') || undefined;
    const kycStatus = searchParams.get('kycStatus') || undefined;
    const isSuspended = searchParams.get('isSuspended') || undefined;
    const location = searchParams.get('location') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    console.log('Admin users GET: Query params:', { search, page, limit, accountType, verificationStatus, kycStatus, isSuspended, location, sortBy, order });

    const where: any = {
      role: { notIn: ['ADMIN', 'SUPER_ADMIN'] } // Exclude admin users from the list
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    if (accountType) where.accountType = accountType;
    if (verificationStatus) {
      // Map verification status to database fields
      switch (verificationStatus) {
        case 'verified':
          where.isVerified = true;
          break;
        case 'pending':
          where.AND = [
            { isVerified: false },
            { verificationLevel: 'EMAIL_VERIFIED' }
          ];
          break;
        case 'unverified':
          where.AND = [
            { isVerified: false },
            { verificationLevel: 'NONE' }
          ];
          break;
        case 'rejected':
          where.kycStatus = 'REJECTED';
          break;
        default:
          break;
      }
    }
    if (kycStatus) where.kycStatus = kycStatus;
    if (isSuspended !== undefined) {
      where.isVerified = isSuspended === 'true' ? false : true;
    }
    if (location) where.location = { contains: location, mode: 'insensitive' };

    console.log('Admin users GET: Where clause:', where);
    console.log('Admin users GET: About to query database...');

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: order as 'asc' | 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          accountType: true,
          verificationLevel: true,
          kycStatus: true,
          createdAt: true,
          updatedAt: true,
          location: true,
          isVerified: true,
          image: true,
          properties: { select: { id: true } },
          payments: { where: { status: 'PAID' }, select: { amount: true } }
        }
      }),
      prisma.user.count({ where })
    ]);

    console.log('Admin users GET: Users found:', users.length);
    console.log('Admin users GET: Total count:', total);

    // Map propertiesCount and totalRevenue, and map field names for frontend compatibility
    const mappedUsers = users.map(u => ({
      ...u,
      propertiesCount: u.properties.length,
      totalRevenue: u.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      // Map field names for frontend compatibility
      verificationStatus: u.isVerified ? 'verified' : 
                         u.verificationLevel === 'EMAIL_VERIFIED' ? 'pending' : 'unverified',
      registrationDate: u.createdAt,
      lastActive: u.updatedAt,
      isSuspended: !u.isVerified,
      avatar: u.image
    }));

    const response = {
      success: true,
      users: mappedUsers,
      total,
      page: Number(page),
      limit: Number(limit)
    };

    return NextResponse.json(serializeBigInt(response));

  } catch (error) {
    console.error('Admin users GET: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create admin user or bulk actions
export async function POST(request: NextRequest) {
  try {
    console.log('Admin users POST: Starting request');

    const session = await getServerSession(authOptions);
    console.log('Admin users POST: Session:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('Admin users POST: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      console.log('Admin users POST: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('Admin users POST: User not admin:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, userIds, userData } = body;

    // Handle bulk actions
    if (action && userIds) {
      switch (action) {
        case 'verify':
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
              isVerified: true,
              verificationLevel: 'FULL_VERIFIED'
            }
          });
          break;

        case 'suspend':
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
              isVerified: false
            }
          });
          break;

        case 'activate':
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
              isVerified: true
            }
          });
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Note: Audit logs removed as AdminAuditLog model doesn't exist in current schema

      return NextResponse.json({
        message: `Users ${action}ed successfully`,
        count: userIds.length
      });
    }

    // Handle single user creation (for admin users)
    if (userData) {
      const { name, email, phone, accountType, role } = userData;

      // Validate required fields
      if (!name || !email || !accountType) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Create admin user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          accountType,
          role: role || 'USER',
          isVerified: true,
          verificationLevel: 'FULL_VERIFIED',
          kycStatus: 'COMPLETED'
        }
      });

      // Note: Audit log removed as AdminAuditLog model doesn't exist in current schema

      return NextResponse.json({
        message: 'Admin user created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          accountType: user.accountType
        }
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Admin users POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 