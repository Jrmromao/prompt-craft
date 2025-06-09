import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DeepseekCostService } from '@/lib/services/deepseekCostService';
import { prisma } from '@/lib/prisma';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Verify admin role
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const costService = DeepseekCostService.getInstance();
  const costs = await costService.calculateMonthlyCosts();

  return NextResponse.json(costs);
}
