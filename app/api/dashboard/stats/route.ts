import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get basic stats
    const totalRuns = await prisma.promptRun.count({
      where: { userId: user.id },
    });

    const totalCost = await prisma.promptRun.aggregate({
      where: { userId: user.id },
      _sum: { cost: true },
    });

    return NextResponse.json({
      totalRuns,
      totalCost: totalCost._sum.cost || 0,
      totalSavings: (totalCost._sum.cost || 0) * 0.3, // Estimate 30% savings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
