import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/app/constants/plans';
import { PlanType } from '@prisma/client';
import { PlanLimitsService } from '@/lib/services/planLimitsService';

const createVersionSchema = z.object({
  content: z.string().min(1),
  description: z.string().optional(),
  commitMessage: z.string().min(1),
  tags: z.array(z.string()).optional(),
  baseVersionId: z.string().optional(),
  tests: z.array(z.object({
    input: z.string().optional(),
    output: z.string(),
    rating: z.object({
      clarity: z.number(),
      specificity: z.number(),
      context: z.number(),
      overall: z.number(),
      feedback: z.string(),
    }).optional(),
  })).optional(),
});

// Add required exports for Next.js 15.3.3
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  context: any
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versionControlService = VersionControlService.getInstance();
    const versions = await versionControlService.getVersion(context.params.id);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planLimitsService = PlanLimitsService.getInstance();
    const isVersionControlAvailable = await planLimitsService.isFeatureAvailable(user.planType, 'version_control');
    
    if (!isVersionControlAvailable) {
      const description = await planLimitsService.getFeatureDescription(user.planType, 'version_control');
      return NextResponse.json(
        { error: description || 'Version control is not available in your current plan. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    // Check version limit
    const versionCount = await prisma.version.count({
      where: {
        promptId: params.id,
        userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // First day of current month
        }
      }
    });

    const { allowed, limit, remaining } = await planLimitsService.checkLimit(
      user.planType,
      'version_control',
      versionCount
    );

    if (!allowed) {
      return NextResponse.json(
        { 
          error: `You have reached your monthly limit of ${limit} versions per prompt. Please upgrade to Elite plan for unlimited versions.`,
          limit,
          remaining
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createVersionSchema.parse(body);

    // Create the version
    const version = await prisma.version.create({
      data: {
        content: validatedData.content,
        userId,
        promptId: params.id,
      },
    });

    return NextResponse.json({
      ...version,
      remainingVersions: remaining - 1
    });
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
