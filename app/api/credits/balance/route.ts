import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { CreditService } from '@/lib/services/creditService';

export async function GET() {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const usage = await CreditService.getInstance().getCreditUsage(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: {
        monthlyCredits: authResult.user.monthlyCredits,
        purchasedCredits: authResult.user.purchasedCredits,
        totalCredits: authResult.user.monthlyCredits + authResult.user.purchasedCredits,
        usage: {
          used: usage.used,
          total: usage.total,
          percentage: usage.percentage,
          nextResetDate: usage.nextResetDate
        },
        planType: authResult.user.planType,
        role: authResult.user.role
      }
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch credit balance'
    }, { status: 500 });
  }
} 