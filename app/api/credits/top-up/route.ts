import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CreditService } from '@/app/lib/services/creditService';
import { logAudit } from '@/app/lib/auditLogger';
import { AuditAction } from '@/app/constants/audit';

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
      await CreditService.addCredits(
        userId,
        amount,
        'Manual credit top-up',
        { source: 'manual' }
      );

      // Get updated balance
      const newBalance = await CreditService.getCreditBalance(userId);

      return NextResponse.json({
        success: true,
        newBalance,
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
