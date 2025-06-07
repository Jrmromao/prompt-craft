import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptId } = await req.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create playground run record
    await prisma.playgroundRun.create({
      data: {
        userId: user.id,
        promptId: promptId || null,
        input: '', // Empty string since we're just tracking usage
        output: null,
      },
    });

    // If promptId is provided, increment the prompt's usage count
    if (promptId) {
      await prisma.prompt.update({
        where: { id: promptId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/playground/track:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
