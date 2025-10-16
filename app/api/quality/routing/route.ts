import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { QualityMonitor } from '@/lib/services/qualityMonitor';

export async function POST(request: Request) {
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

    const { enabled } = await request.json();

    if (enabled) {
      await QualityMonitor.enableRouting(user.id);
    } else {
      await QualityMonitor.disableRouting(user.id);
    }

    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error('Routing toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle routing' },
      { status: 500 }
    );
  }
}

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

    const status = await QualityMonitor.getRoutingStatus(user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Routing status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routing status' },
      { status: 500 }
    );
  }
}
