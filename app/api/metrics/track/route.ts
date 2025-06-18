import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const trackMetricSchema = z.object({
  type: z.string(),
  tokenCount: z.number(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const result = trackMetricSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { type, tokenCount, metadata } = result.data;

  await prisma.usageMetrics.create({
    data: {
      userId,
      type,
      tokenCount,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
      success: true,
      type,
      tokenCount,
      metadata,
  });
} 