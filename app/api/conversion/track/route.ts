import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event, trigger, data } = await req.json();

    // Track conversion events - update lastActiveAt
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        lastActiveAt: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    return NextResponse.json({ error: 'Failed to track conversion' }, { status: 500 });
  }
}
