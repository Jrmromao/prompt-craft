import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PlanLimitsService } from '@/lib/services/planLimitsService';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const service = PlanLimitsService.getInstance();
  const available = await service.isFeatureAvailable(user.id, 'playground');
  
  if (!available) {
    return NextResponse.json(
      { success: false, error: 'Test runs are not available in your current plan. Please upgrade to continue.' },
      { status: 403 }
    );
  }

  const limitCheck = await service.checkLimit(user.id, 'playground');
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { success: false, error: `You've reached your limit of ${limitCheck.limit} test runs. Please upgrade to continue.` },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, data: limitCheck });
}
