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
      Subscription: true, // Use correct relation name
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

  // If user has an active subscription, allow full access
  if (user.Subscription?.status === 'ACTIVE') {
    return { canCreate: true, isPro: true };
  }

  // Free users can always view their prompts page
  // They just have limited creation abilities
  return { 
    canCreate: user.Prompt.length === 0, // Can create if no prompts yet
    isPro: false,
    isLastFree: user.Prompt.length === 0
  };
}
