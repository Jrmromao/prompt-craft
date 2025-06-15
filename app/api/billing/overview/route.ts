import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { BillingService } from '@/lib/services/billingService';
import { UserService } from '@/lib/services/userService';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';
import { prisma } from '@/lib/prisma';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const billingData = await BillingService.getInstance().getBillingOverview(userId);
    
    // Get user's credits data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        monthlyCredits: true,
        purchasedCredits: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add credits data to the response
    const responseData = {
      ...billingData,
      credits: {
        monthly: user.monthlyCredits,
        purchased: user.purchasedCredits,
        total: user.monthlyCredits + user.purchasedCredits,
      },
    };

    // get the database id from userService
    const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);
    if (!userDatabaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await AuditService.getInstance().logAudit({
      action: AuditAction.BILLING_OVERVIEW_VIEWED,
      userId: userDatabaseId,
      resource: 'billing',
      details: {},
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching billing overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
