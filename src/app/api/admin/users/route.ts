import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users - Get all users with admin information
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions, req, {} as any);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { search, page = 1, limit = 20, accountType, verificationStatus, kycStatus, location, sortBy = 'registrationDate', order = 'desc' } = Object.fromEntries(req.nextUrl.searchParams);

  const where: any = { role: { not: 'admin' } };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } }
    ];
  }
  if (accountType) where.accountType = accountType;
  if (verificationStatus) where.verificationStatus = verificationStatus;
  if (kycStatus) where.kycStatus = kycStatus;
  if (location) where.location = { contains: location, mode: 'insensitive' };

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
        verificationStatus: true,
        kycStatus: true,
        registrationDate: true,
        lastActive: true,
        location: true,
        isSuspended: true,
        avatar: true,
        properties: { select: { id: true } },
        payments: { where: { status: 'SUCCESS' }, select: { amount: true } }
      }
    }),
    prisma.user.count({ where })
  ]);

  // Map propertiesCount and totalRevenue
  const mappedUsers = users.map(u => ({
    ...u,
    propertiesCount: u.properties.length,
    totalRevenue: u.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  }));

  return NextResponse.json({
    users: mappedUsers,
    total,
    page: Number(page),
    limit: Number(limit)
  });
}

// POST /api/admin/users - Create admin user or bulk actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.email?.includes('admin') || 
                   session.user.email === 'admin@larnacei.com';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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