import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/lib/services/creditService';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { CreditType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    try {
      await CreditService.getInstance().addCredits(
        userId,
        amount,
        CreditType.TOP_UP,
        'Manual credit top-up'
      );

      // Get updated balance
      const creditCheck = await CreditService.getInstance().checkCreditBalance(userId, 0);

      return NextResponse.json({
        success: true,
        newBalance: creditCheck.monthlyCredits + creditCheck.purchasedCredits,
        message: 'Credits added successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in credit top-up:', error);
    return NextResponse.json(
      { error: 'Failed to process credit top-up' },
      { status: 500 }
    );
  }
}
