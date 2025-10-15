import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get prompts count
    const promptsCount = await prisma.prompt.count({
      where: { userId: userId }
    });

    // Get credits used (approximate from credit history)
    const creditHistory = await prisma.creditHistory.aggregate({
      where: { 
        userId: user.id,
        amount: { lt: 0 } // Only negative amounts (usage)
      },
      _sum: { amount: true }
    });

    // Get last activity
    const lastPrompt = await prisma.prompt.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const creditsUsed = Math.abs(creditHistory._sum.amount || 0);
    const lastActivity = lastPrompt?.createdAt 
      ? new Date(lastPrompt.createdAt).toLocaleDateString()
      : 'No activity yet';

    return NextResponse.json({
      promptsCreated: promptsCount,
      creditsUsed: creditsUsed,
      lastActivity: lastActivity
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
