import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

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

    const { search, page = 1, limit = 20, accountType, verificationStatus, kycStatus, location, sortBy = 'registrationDate', order = 'desc' } = Object.fromEntries(req.nextUrl.searchParams);

    console.log('Admin users GET: Query params:', { search, page, limit, accountType, verificationStatus, kycStatus, location, sortBy, order });

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
      // Map verification status to verification level
      const statusMap: { [key: string]: string } = {
        'verified': 'FULL_VERIFIED',
        'pending': 'EMAIL_VERIFIED',
        'unverified': 'NONE',
        'rejected': 'NONE'
      };
      where.verificationLevel = statusMap[verificationStatus] || verificationStatus.toUpperCase();
    }
    if (kycStatus) where.kycStatus = kycStatus;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    console.log('Admin users GET: Where clause:', where);
    console.log('Admin users GET: About to query database...');

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          accountType: true,
          verificationLevel: true, // Use verificationLevel instead of verificationStatus
          kycStatus: true,
          createdAt: true, // Use createdAt instead of registrationDate
          updatedAt: true, // Use updatedAt instead of lastActive
          location: true,
          isVerified: true, // Use isVerified instead of isSuspended
          image: true, // Use image instead of avatar
          properties: { select: { id: true } },
          payments: { where: { status: 'SUCCESS' }, select: { amount: true } }
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
      totalRevenue: u.payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      // Map field names for frontend compatibility
      verificationStatus: u.verificationLevel?.toLowerCase() || 'none',
      registrationDate: u.createdAt,
      lastActive: u.updatedAt,
      isSuspended: !u.isVerified,
      avatar: u.image
    }));

    return NextResponse.json({
      success: true,
      users: mappedUsers,
      total,
      page: Number(page),
      limit: Number(limit)
    });

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
              verificationStatus: 'VERIFIED',
              verifiedAt: new Date(),
              verifiedBy: session.user.id
            }
          });
          break;

        case 'suspend':
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
              isSuspended: true,
              suspendedAt: new Date(),
              suspendedBy: session.user.id
            }
          });
          break;

        case 'activate':
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
              isSuspended: false,
              suspendedAt: null,
              suspendedBy: null
            }
          });
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Create audit logs for bulk actions
      await prisma.adminAuditLog.createMany({
        data: userIds.map((userId: string) => ({
          action: `${action.toUpperCase()}_USER`,
          adminId: session.user.id,
          targetType: 'USER',
          targetId: userId,
          details: { action, bulkOperation: true }
        }))
      });

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
          verificationStatus: 'VERIFIED',
          kycStatus: 'COMPLETED',
          verifiedAt: new Date(),
          verifiedBy: session.user.id,
          isAdminCreated: true
        }
      });

      // Create audit log
      await prisma.adminAuditLog.create({
        data: {
          action: 'CREATE_ADMIN_USER',
          adminId: session.user.id,
          targetType: 'USER',
          targetId: user.id,
          details: { accountType, role }
        }
      });

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