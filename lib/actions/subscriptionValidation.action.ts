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
    include: {
      subscription: true,
      prompts: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // If user has an active subscription, allow full access
  if (user.subscription?.status === 'ACTIVE') {
    return { canCreate: true, isPro: true };
  }

  // Free users can always view their prompts page
  // They just have limited creation abilities
  return { 
    canCreate: user.prompts.length === 0, // Can create if no prompts yet
    isPro: false,
    isLastFree: user.prompts.length === 0
  };
}
