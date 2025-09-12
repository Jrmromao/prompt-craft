import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const webVitalSchema = z.object({
  name: z.string(),
  value: z.number(),
  rating: z.string(),
  delta: z.number(),
  id: z.string(),
  url: z.string(),
  userAgent: z.string(),
  timestamp: z.number(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    const body = await request.json();
    const metric = webVitalSchema.parse(body);

    // TODO: Store web vital metric when webVital model is available
    // await prisma.webVital.create({
    //   data: {
    //     userId: userId || null,
    //     name: metric.name,
    //     value: metric.value,
    //     rating: metric.rating,
    //     delta: metric.delta,
    //     metricId: metric.id,
    //     url: metric.url,
    //     userAgent: metric.userAgent,
    //     timestamp: new Date(metric.timestamp),
    //     sessionId: request.headers.get('x-session-id') || null,
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing web vital:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store web vital' },
      { status: 500 }
    );
  }
}
