import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/lib/services/creditService';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with credit information
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        monthlyCredits: true,
        purchasedCredits: true,
        lastMonthlyReset: true,
        planType: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get credit usage information
    const creditService = CreditService.getInstance();
    const usage = await creditService.getCreditUsage(user.id);

    return NextResponse.json({
      monthlyCredits: user.monthlyCredits,
      purchasedCredits: user.purchasedCredits,
      totalCredits: user.monthlyCredits + user.purchasedCredits,
      lastMonthlyReset: user.lastMonthlyReset,
      planType: user.planType,
      role: user.role,
      usage: {
        monthlyUsed: usage.monthlyUsed,
        monthlyTotal: usage.monthlyTotal,
        monthlyPercentage: usage.monthlyPercentage,
        purchasedTotal: usage.purchasedTotal,
        nextResetDate: usage.periodEnd
      }
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 }
    );
  }
} 