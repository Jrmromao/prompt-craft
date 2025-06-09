import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [subscription, usage] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        include: {
          plan: true,
        },
      }),
      prisma.promptUsage.findMany({
        where: { userId },
        select: {
          createdAt: true,
          result: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 30, // Last 30 days
      }),
    ]);

    // Calculate credits used from the result field
    const totalCreditsUsed = usage.reduce((sum, u) => {
      const result = u.result as { creditsUsed?: number } | null;
      return sum + (result?.creditsUsed || 0);
    }, 0);
    
    const averageDailyUsage = totalCreditsUsed / (usage.length || 1);

    return NextResponse.json({
      subscription,
      usage: {
        total: totalCreditsUsed,
        average: averageDailyUsage,
        history: usage,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
