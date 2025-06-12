import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
} 