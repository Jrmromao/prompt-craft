import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

// Define the main handler
async function userDetailHandler(request: Request, context?: { params?: Record<string, string> }) {
  const targetUserId = context?.params?.id || '';

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
    where: { id: targetUserId },
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

// Define fallback data
const fallbackData = {
  id: '',
  name: '',
  email: '',
  role: 'USER',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _count: {
    prompts: 0,
    promptUsages: 0,
    apiKeys: 0,
  },
  prompts: [],
  promptUsages: [],
};

// Export the wrapped handler
export const GET = withDynamicRoute(userDetailHandler, fallbackData);

// Keep the PATCH handler as is since it's already dynamic
export async function PATCH(request: Request, context: { params: Record<string, string> }) {
  // ... existing PATCH handler code ...
} 