import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's credit history
    const creditHistory = await prisma.creditHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Last 30 days
    });

    // Get daily usage for the chart
    const days = 30;
    const now = new Date();
    const dailyUsage = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const used = creditHistory
        .filter(h => format(h.createdAt, 'yyyy-MM-dd') === dayStr)
        .reduce((sum, h) => sum + Math.abs(h.amount), 0);
      dailyUsage.push({ date: dayStr, credits: used });
    }

    // Get recent activity
    const recentActivity = creditHistory.slice(0, 10).map(h => ({
      id: h.id,
      type: h.type,
      amount: h.amount,
      description: h.description,
      createdAt: h.createdAt.toISOString(),
    }));

    // Get current credit balance and cap
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyCredits: true, purchasedCredits: true, creditCap: true, planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentBalance: (user.monthlyCredits + user.purchasedCredits),
      creditCap: user.creditCap,
      planType: user.planType,
      dailyUsage,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching credit usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit usage' },
      { status: 500 }
    );
  }
} 