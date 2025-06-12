import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RealtimeUsageService } from '@/lib/services/usage/realtimeUsageService';
import { z } from 'zod';

const realtimeUsageService = RealtimeUsageService.getInstance();

const trackUsageSchema = z.object({
  feature: z.string(),
  count: z.number().min(1).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { feature, count } = trackUsageSchema.parse(body);

    await realtimeUsageService.trackRealtimeUsage(userId, feature, count);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking real-time usage:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature');

    if (feature) {
      const usage = await realtimeUsageService.getRealtimeUsage(userId, feature);
      return NextResponse.json({ feature, usage });
    }

    const allUsage = await realtimeUsageService.getAllRealtimeUsage(userId);
    return NextResponse.json(allUsage);
  } catch (error) {
    console.error('Error fetching real-time usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
} 