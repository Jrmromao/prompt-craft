import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';
import { Period } from '@prisma/client';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({
        status: 'INCOMPLETE',
        plan: {
          id: 'free',
          name: 'FREE',
          description: 'Free plan',
          price: 0,
          period: Period.MONTHLY,
          features: ['Basic access'],
          isActive: true,
          isEnterprise: false,
          stripeProductId: '',
          stripePriceId: '',
          stripeAnnualPriceId: null,
          credits: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        currentPeriodEnd: new Date(),
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
