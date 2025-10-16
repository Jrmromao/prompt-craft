import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        Subscription: true,
        PromptRun: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = user.Subscription?.plan || 'FREE';
    const runsThisMonth = user.PromptRun.length;
    
    // Plan limits
    const limits: Record<string, number> = {
      FREE: 100,
      STARTER: 500,
      PRO: 2000,
      ENTERPRISE: -1, // unlimited
    };

    const runsLimit = limits[plan] || 100;
    const percentUsed = runsLimit > 0 ? parseFloat(((runsThisMonth / runsLimit) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      plan: plan.toLowerCase(),
      runsThisMonth,
      runsLimit: runsLimit > 0 ? runsLimit : 'unlimited',
      percentUsed: runsLimit > 0 ? percentUsed : 0,
    });
  } catch (error) {
    console.error('Usage error:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
