import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function metricHandler(request: Request, context?: { params?: { metric?: string } }) {
  const metric = context?.params?.metric || '';

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const interval = searchParams.get('interval') || 'day';

  let data;
  switch (metric) {
    case 'usage':
      data = await getUsageMetrics(startDate, endDate, interval);
      break;
    case 'users':
      data = await getUserMetrics(startDate, endDate, interval);
      break;
    case 'prompts':
      data = await getPromptMetrics(startDate, endDate, interval);
      break;
    default:
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
  }

  return NextResponse.json(data);
}

// Define fallback data
const fallbackData = {
  labels: [],
  datasets: [],
  total: 0,
  change: 0,
};

// Export the wrapped handler
export const GET = withDynamicRoute(metricHandler, fallbackData);

async function getUsageMetrics(startDate: string | null, endDate: string | null, interval: string) {
  const where = {
    createdAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
  };

  const usages = await prisma.promptUsage.groupBy({
    by: ['createdAt'],
    where,
    _count: true,
    orderBy: {
      createdAt: 'asc',
    },
  });

  return {
    labels: usages.map(u => u.createdAt.toISOString()),
    datasets: [{
      label: 'Usage',
      data: usages.map(u => u._count),
    }],
    total: usages.reduce((acc, u) => acc + u._count, 0),
    change: calculateChange(usages),
  };
}

async function getUserMetrics(startDate: string | null, endDate: string | null, interval: string) {
  const where = {
    createdAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
  };

  const users = await prisma.user.groupBy({
    by: ['createdAt'],
    where,
    _count: true,
    orderBy: {
      createdAt: 'asc',
    },
  });

  return {
    labels: users.map(u => u.createdAt.toISOString()),
    datasets: [{
      label: 'New Users',
      data: users.map(u => u._count),
    }],
    total: users.reduce((acc, u) => acc + u._count, 0),
    change: calculateChange(users),
  };
}

async function getPromptMetrics(startDate: string | null, endDate: string | null, interval: string) {
  const where = {
    createdAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
  };

  const prompts = await prisma.prompt.groupBy({
    by: ['createdAt'],
    where,
    _count: true,
    orderBy: {
      createdAt: 'asc',
    },
  });

  return {
    labels: prompts.map(p => p.createdAt.toISOString()),
    datasets: [{
      label: 'New Prompts',
      data: prompts.map(p => p._count),
    }],
    total: prompts.reduce((acc, p) => acc + p._count, 0),
    change: calculateChange(prompts),
  };
}

function calculateChange(data: { _count: number }[]) {
  if (data.length < 2) return 0;
  const first = data[0]._count;
  const last = data[data.length - 1]._count;
  return first === 0 ? 100 : ((last - first) / first) * 100;
} 