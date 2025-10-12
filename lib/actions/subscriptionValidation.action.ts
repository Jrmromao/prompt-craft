import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function validateSubscription() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      planType: true,
      Subscription: true,
      Prompt: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/sign-in');
  }

  const promptCount = user.Prompt.length;
  const isPro = user.Subscription?.status === 'ACTIVE' || user.planType === 'PRO';

  // PRO users: unlimited access
  if (isPro) {
    return { 
      canCreate: true, 
      isPro: true,
      promptsUsed: promptCount,
      promptsRemaining: 'unlimited'
    };
  }

  // FREE users: 10 prompt limit
  const FREE_LIMIT = 10;
  const canCreate = promptCount < FREE_LIMIT;
  const promptsRemaining = FREE_LIMIT - promptCount;

  return { 
    canCreate,
    isPro: false,
    promptsUsed: promptCount,
    promptsRemaining: Math.max(0, promptsRemaining),
    isAtLimit: promptCount >= FREE_LIMIT
  };
}
