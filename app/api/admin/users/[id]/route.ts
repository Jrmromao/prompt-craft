import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  context: any
) {
  const { id } = context.params;

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

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          prompts: true,
          promptUsages: true,
          apiKeys: true,
        },
      },
      prompts: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              usages: true,
            },
          },
        },
      },
      promptUsages: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          prompt: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  context: any
) {
  const { id } = context.params;

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
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
