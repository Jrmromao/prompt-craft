import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/app/constants/plans';
import { PlanType } from '@prisma/client';
import { PlanLimitsService } from '@/lib/services/planLimitsService';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const versionControlService = VersionControlService.getInstance();
    const versions = await versionControlService.getVersion(params.id);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const body = await request.json();
    const validationResult = versionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { content, description, commitMessage, tags, baseVersionId, tests } = validationResult.data;
    const versionControlService = VersionControlService.getInstance();
    const version = await versionControlService.createVersion(
      params.id,
      content,
      description ?? null,
      commitMessage,
      tags ?? [],
      baseVersionId,
      tests
    );

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error creating version:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

// Validation schema for version creation
const versionSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  description: z.string().nullable().optional(),
  commitMessage: z.string().min(1, 'Commit message is required'),
  tags: z.array(z.string()).optional(),
  baseVersionId: z.string().optional(),
  tests: z.array(z.object({
    input: z.string().optional(),
    output: z.string(),
    rating: z.object({
      clarity: z.number().min(1).max(10),
      specificity: z.number().min(1).max(10),
      context: z.number().min(1).max(10),
      overall: z.number().min(1).max(10),
      feedback: z.string()
    }).optional()
  })).optional()
});
