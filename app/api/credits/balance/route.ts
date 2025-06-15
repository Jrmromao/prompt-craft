import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/lib/services/creditService';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        monthlyCredits: true,
        purchasedCredits: true,
        lastCreditReset: true,
        planType: true,
        role: true
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const usage = await CreditService.getInstance().getCreditUsage(user.id);

    return NextResponse.json({
      monthlyCredits: user.monthlyCredits,
      purchasedCredits: user.purchasedCredits,
      totalCredits: user.monthlyCredits + user.purchasedCredits,
      lastReset: user.lastCreditReset,
      usage: {
        used: usage.used,
        total: usage.total,
        percentage: usage.percentage,
        nextResetDate: usage.nextResetDate
      },
      planType: user.planType,
      role: user.role
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 