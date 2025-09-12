import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/lib/services/creditService';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get or create user with default credit values
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: '', // Will be updated later
        monthlyCredits: 1000, // Default monthly credits
        purchasedCredits: 0,
        planType: 'FREE', // Default plan type
        creditCap: 100, // Default credit cap
      }
    });

    // Get credit usage using CreditService
    const creditService = CreditService.getInstance();
    const creditUsage = await creditService.getCreditUsage(dbUser.id);

    // Calculate total available credits
    const totalCredits = dbUser.monthlyCredits + dbUser.purchasedCredits;

    return NextResponse.json({
      balance: {
        monthlyCredits: dbUser.monthlyCredits,
        purchasedCredits: dbUser.purchasedCredits,
        totalCredits
      },
      usage: {
        monthlyTotal: creditUsage.used,
        monthlyPercentage: creditUsage.percentage,
        lastReset: creditUsage.nextResetDate
      }
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user credits' },
      { status: 500 }
    );
  }
} 