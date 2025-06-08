import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { prisma } from '@/lib/prisma';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function copyHandler(request: Request, context?: { params?: Record<string, string> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = context?.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Get user's database ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Create copy record
      await tx.promptCopy.create({
        data: {
          promptId: id,
          userId: user.id,
        },
      });

      // Update prompt copy count
      await tx.prompt.update({
        where: { id },
        data: {
          copyCount: {
            increment: 1,
          },
        },
      });
    });

    const promptService = PromptService.getInstance();
    const copiedPrompt = await promptService.copyPrompt(id, user.id);
    return NextResponse.json(copiedPrompt);
  } catch (error) {
    console.error('Error copying prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const POST = withDynamicRoute(copyHandler, fallbackData);
