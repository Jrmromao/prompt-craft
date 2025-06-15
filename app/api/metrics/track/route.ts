import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/baseApiHandler';
import { ValidationError } from '@/types/errors';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const trackMetricSchema = z.object({
  type: z.string(),
  tokenCount: z.number(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

type TrackMetricRequest = z.infer<typeof trackMetricSchema>;

export const POST = createApiHandler<TrackMetricRequest>(async (req) => {
  const { userId } = await auth();
  if (!userId) {
    return {
      error: {
        type: 'API_ERROR',
        message: 'Unauthorized',
        status: 401
      },
    };
  }

  const body = await req.json();
  const result = trackMetricSchema.safeParse(body);

  if (!result.success) {
    const error: ValidationError = {
      type: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      field: 'body',
    };
    throw error;
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

  return {
    data: {
      success: true,
      type,
      tokenCount,
      metadata,
    },
  };
}, trackMetricSchema); 