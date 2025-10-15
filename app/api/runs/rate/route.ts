import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { runId, success, rating } = body;

    await prisma.promptRun.update({
      where: { id: runId, userId: user.id },
      data: {
        success,
        rating: rating || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rate prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to rate prompt' },
      { status: 500 }
    );
  }
}
