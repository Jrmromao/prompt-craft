import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS, checkAISpendLimit } from '@/lib/middleware/planLimits';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const limits = PLAN_LIMITS[user.planType];
    const spendCheck = await checkAISpendLimit(user.id);

    return NextResponse.json({
      plan: user.planType,
      limits,
      usage: {
        aiSpend: {
          current: spendCheck.currentSpend,
          limit: spendCheck.limit,
          percentUsed: spendCheck.percentUsed,
          allowed: spendCheck.allowed,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching plan limits:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
