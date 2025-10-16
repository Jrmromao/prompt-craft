import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { SavingsCalculator } from '@/lib/services/savingsCalculator';

export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // today, month, all

    let startDate = new Date();
    const endDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // All time
      startDate = new Date(user.createdAt);
    }

    const savings = await SavingsCalculator.getSavings(user.id, startDate, endDate);

    return NextResponse.json(savings);
  } catch (error) {
    console.error('Savings calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate savings' },
      { status: 500 }
    );
  }
}
