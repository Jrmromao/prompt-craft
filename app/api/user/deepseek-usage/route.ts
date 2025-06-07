import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DeepseekCostService } from '@/lib/services/deepseekCostService';
import { prisma } from '@/lib/prisma';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's database ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const costService = DeepseekCostService.getInstance();
    const usage = await costService.getTotalUsage();

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching DeepSeek usage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
