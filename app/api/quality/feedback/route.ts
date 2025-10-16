import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { runId, rating, feedback } = await req.json();

    const qualityFeedback = await prisma.qualityFeedback.create({
      data: {
        userId: user.id,
        runId,
        rating,
        feedback,
      },
    });

    return NextResponse.json(qualityFeedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
