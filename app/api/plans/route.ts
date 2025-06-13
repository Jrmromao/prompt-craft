import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PLAN_TIERS } from '@/constants/plans';

export async function GET() {
  try {
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
        credits: true,
      },
    });

    // Enhance plans with tier information
    const enhancedPlans = plans.map(plan => {
      const tier = PLAN_TIERS[plan.name as keyof typeof PLAN_TIERS];
      return {
        ...plan,
        credits: tier?.credits || plan.credits,
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