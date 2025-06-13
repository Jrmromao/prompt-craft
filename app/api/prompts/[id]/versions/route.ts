import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { VersionControlService } from '@/lib/services/versionControlService';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/app/constants/plans';
import { PlanType } from '@prisma/client';

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
  request: Request,
  context: any
) {
  try {
    console.log('Received POST request for versions');
    console.log('Params:', context.params);
    
    const { userId } = await auth();
    if (!userId) {
      console.log('Unauthorized: No userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user's plan allows version creation
    const plan = PLANS[user.planType.toUpperCase() as PlanType];
    if (!plan?.features.versionControl) {
      return NextResponse.json(
        { error: 'Version control is not available in your current plan. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    const promptId = context.params.id;
    if (!promptId) {
      console.log('Bad request: No promptId');
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const validationResult = createVersionSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.format());
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { content, description, commitMessage, tags, baseVersionId, tests } = validationResult.data;
    console.log('Creating version with:', { content, description, commitMessage, tags, baseVersionId, tests });
    
    const versionControlService = VersionControlService.getInstance();
    const newVersion = await versionControlService.createVersion(
      promptId,
      content,
      description || null,
      commitMessage,
      tags || [],
      baseVersionId,
      tests || []
    );

    console.log('Version created successfully:', newVersion);
    return NextResponse.json(newVersion);
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create version' },
      { status: 500 }
    );
  }
}
