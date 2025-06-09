import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  const { metric } = context.params;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

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
    // Validate date range if provided
    if (startDate || endDate) {
      dateRangeSchema.parse({ startDate, endDate });
    }

    let data;
    switch (metric) {
      case 'total-users':
        data = await prisma.user.count();
        break;
      case 'total-prompts':
        data = await prisma.prompt.count();
        break;
      case 'total-usage':
        data = await prisma.promptUsage.count();
        break;
      case 'usage-by-date':
        data = await prisma.promptUsage.groupBy({
          by: ['createdAt'],
          _count: true,
          where: {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });
        break;
      case 'usage-by-prompt':
        data = await prisma.promptUsage.groupBy({
          by: ['promptId'],
          _count: true,
          where: {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          },
          orderBy: {
            _count: {
              promptId: 'desc',
            },
          },
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
