import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Route configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = context.params.id;
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Get the database user ID from the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the original prompt
    const originalPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        tags: true,
      },
    });

    if (!originalPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Create a copy of the prompt
    const copiedPrompt = await prisma.prompt.create({
      data: {
        name: `${originalPrompt.name} (Copy)`,
        slug: `${originalPrompt.slug}-copy`,
        content: originalPrompt.content,
        description: originalPrompt.description,
        userId: user.id,
        tags: {
          connect: originalPrompt.tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(copiedPrompt);
  } catch (error) {
    console.error('Error copying prompt:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
