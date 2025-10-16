import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { QualityMonitor } from '@/lib/services/qualityMonitor';

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

    const { runId, rating, feedback } = await request.json();

    if (!runId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid input. Rating must be 1-5.' },
        { status: 400 }
      );
    }

    await QualityMonitor.submitFeedback(user.id, runId, rating, feedback);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quality feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
