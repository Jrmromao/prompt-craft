import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, UserStatus } from '@prisma/client';

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
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') as 'USER' | 'ADMIN' | null;
  const isActive = searchParams.get('isActive');

  const { userId } = await auth();
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
