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

  // If user has an active subscription, allow access
  if (user.subscription?.status === 'ACTIVE') {
    return { canCreate: true };
  }

  // If user has no prompts yet, allow one free prompt
  if (user.prompts.length === 0) {
    return { canCreate: true, isLastFree: true };
  }

  // If user has used their free prompt and has no subscription, redirect to pricing
  return { canCreate: false, redirectTo: '/pricing' };
}
