import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.subscription) {
      return NextResponse.json({
        name: 'FREE',
        status: 'ACTIVE',
      });
    }

    return NextResponse.json({
      name: user.subscription.plan.name,
      status: user.subscription.status,
      periodEnd: user.subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 