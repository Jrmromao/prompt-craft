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
      include: {
        Subscription: {
          include: {
            Plan: true,
          },
        },
      },
    });

    if (!user?.Subscription) {
      return NextResponse.json(null);
    }

    return NextResponse.json(user.Subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
