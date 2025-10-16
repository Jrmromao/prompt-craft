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

    // Track conversion events
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        metadata: {
          lastConversionEvent: event,
          lastConversionTrigger: trigger,
          lastConversionData: data,
          lastConversionAt: new Date().toISOString(),
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    return NextResponse.json({ error: 'Failed to track conversion' }, { status: 500 });
  }
}
