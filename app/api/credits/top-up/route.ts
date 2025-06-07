import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/lib/services/creditService';
import { CreditType } from '@/utils/constants';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const creditService = CreditService.getInstance();
    const newBalance = await creditService.addCredits(
      userId,
      amount,
      CreditType.TOP_UP,
      'Manual credit top-up'
    );

    return NextResponse.json({ newBalance });
  } catch (error) {
    console.error('Error topping up credits:', error);
    return NextResponse.json({ error: 'Failed to top up credits' }, { status: 500 });
  }
}
