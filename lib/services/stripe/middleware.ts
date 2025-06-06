import { NextResponse } from 'next/server';
import { SubscriptionStatus } from './schema';
import { prisma } from '@/lib/prisma';

export async function validateSubscriptionStatus(
  userId: string,
  requiredStatus: SubscriptionStatus | SubscriptionStatus[]
): Promise<{ isValid: boolean; subscription: any | null }> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user || !user.subscription) {
      return { isValid: false, subscription: null };
    }

    const statuses = Array.isArray(requiredStatus) ? requiredStatus : [requiredStatus];
    const isValid = statuses.includes(user.subscription.status.toLowerCase() as SubscriptionStatus);

    return { isValid, subscription: user.subscription };
  } catch (error) {
    console.error('Subscription validation error:', error);
    return { isValid: false, subscription: null };
  }
}

export async function withSubscriptionValidation(
  handler: Function,
  requiredStatus: SubscriptionStatus | SubscriptionStatus[]
) {
  return async (req: Request, context: any) => {
    const { userId } = context.auth;
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { isValid, subscription } = await validateSubscriptionStatus(userId, requiredStatus);
    if (!isValid) {
      return new NextResponse('Subscription required', { status: 403 });
    }

    return handler(req, { ...context, subscription });
  };
}

export function validateSubscriptionTransition(
  currentStatus: SubscriptionStatus,
  newStatus: SubscriptionStatus
): boolean {
  const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
    active: ['canceled', 'past_due', 'unpaid'],
    canceled: ['active'],
    incomplete: ['active', 'incomplete_expired'],
    incomplete_expired: ['active'],
    past_due: ['active', 'canceled', 'unpaid'],
    trialing: ['active', 'canceled', 'past_due'],
    unpaid: ['active', 'canceled'],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

export function getSubscriptionStatusDisplay(status: SubscriptionStatus): {
  label: string;
  color: string;
  description: string;
} {
  const statusConfig: Record<
    SubscriptionStatus,
    { label: string; color: string; description: string }
  > = {
    active: {
      label: 'Active',
      color: 'green',
      description: 'Your subscription is active and in good standing.',
    },
    canceled: {
      label: 'Canceled',
      color: 'gray',
      description: 'Your subscription has been canceled and will end at the current period.',
    },
    incomplete: {
      label: 'Incomplete',
      color: 'yellow',
      description: 'Your subscription requires additional action to become active.',
    },
    incomplete_expired: {
      label: 'Expired',
      color: 'red',
      description: 'Your subscription setup has expired.',
    },
    past_due: {
      label: 'Past Due',
      color: 'orange',
      description: 'Your subscription payment is past due.',
    },
    trialing: {
      label: 'Trial',
      color: 'blue',
      description: 'Your subscription is in trial period.',
    },
    unpaid: {
      label: 'Unpaid',
      color: 'red',
      description: 'Your subscription payment has failed.',
    },
  };

  return (
    statusConfig[status] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown subscription status.',
    }
  );
}
