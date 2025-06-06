import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

interface PromptUsage {
  creditsUsed: number;
  createdAt: Date;
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('userId');

  if (!targetUserId) {
    return new NextResponse('User ID is required', { status: 400 });
  }

  // Verify the requesting user has access to this data
  if (targetUserId !== userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get the user's planType
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { planType: true },
  });
  if (!user) {
    return new NextResponse('User not found', { status: 404 });
  }

  // Get Playground runs for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const playgroundRunsCount = await prisma.playgroundRun.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });

  // Get the last 7 days of prompt generation usage (existing logic)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const generations = await prisma.promptGeneration.findMany({
    where: {
      userId: targetUserId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      creditsUsed: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group generations by date and sum credits
  const usageByDate = generations.reduce((acc: Record<string, number>, gen: PromptUsage) => {
    const date = gen.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + gen.creditsUsed;
    return acc;
  }, {});

  // Fill in missing dates with 0
  const data = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    data.unshift({
      date: dateStr,
      credits: usageByDate[dateStr] || 0,
    });
  }

  return NextResponse.json({
    planType: user.planType,
    playgroundRunsThisMonth: playgroundRunsCount,
    promptGenerationUsage: data,
  });
}
