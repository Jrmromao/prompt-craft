import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdminUserService } from '@/lib/services/AdminUserService';
import { z } from 'zod';
import { UserStatus } from '@prisma/client';
import { AuditAction } from '@/app/constants/audit';
import { AuditService } from '@/lib/services/auditService';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
});

const userQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.string().optional(),
});

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;

    const adminUserService = AdminUserService.getInstance();
    const users = await adminUserService.getUsers({ search, role });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Validate query parameters
    userQuerySchema.parse({
      page,
      limit,
      search,
      role,
      isActive,
    });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: Prisma.UserWhereInput = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        } : {},
        role ? { role } : {},
        isActive ? { status: isActive === 'true' ? UserStatus.ACTIVE : UserStatus.SUSPENDED } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              prompts: true,
              promptUsages: true,
              apiKeys: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // get user databaseId from userService 
    const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);
    if (!userDatabaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await AuditService.getInstance().logAudit({
      action: AuditAction.ADMIN_GET_USERS,
      userId: userDatabaseId,
      resource: 'users',
      status: 'success',
      details: { users },
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page),
        limit: take,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
