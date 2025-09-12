import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/app/constants/plans';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        period: true,
        features: true,
        isEnterprise: true,
        stripeProductId: true,
        stripePriceId: true,
        stripeAnnualPriceId: true,
      },
    });

    // Enhance plans with tier information
    const enhancedPlans = plans.map(plan => {
      const tier = PLANS[plan.name.toUpperCase() as keyof typeof PLANS];
      return {
        ...plan,
        features: tier?.features || plan.features,
      };
    });

    return NextResponse.json({ plans: enhancedPlans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
} 