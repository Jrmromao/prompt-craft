export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PlanLimitsService } from '@/lib/services/planLimitsService';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { canCreate: false, isLastFree: false, redirectTo: '/sign-in' },
        { status: 401 }
      );
    }

    // Get user and their subscription
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        planType: true,
        subscription: {
          include: {
            plan: true
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { canCreate: false, isLastFree: false, redirectTo: '/sign-up' },
        { status: 404 }
      );
    }

    const planLimitsService = PlanLimitsService.getInstance();

    // Check if user can create prompts
    const isPromptCreationAvailable = await planLimitsService.isFeatureAvailable(user.planType, 'prompt_creation');
    if (!isPromptCreationAvailable) {
      return NextResponse.json({
        canCreate: false,
        isLastFree: false,
        redirectTo: '/pricing',
        reason: await planLimitsService.getFeatureDescription(user.planType, 'prompt_creation')
      });
    }

    // Count prompts created by the user

    // Check prompt creation limit
    const { allowed, limit, remaining } = await planLimitsService.checkLimit(
      user.planType,
      'prompt_creation',
    );

    const canCreate = allowed;
    const isLastFree = limit > 0 && remaining === 1;
    const redirectTo = canCreate ? null : '/pricing';

    // Get all feature limits for the user's plan
    const features = ['prompt_creation', 'test_runs', 'version_control', 'private_prompts'];
    const limits = await Promise.all(
      features.map(async (feature) => {
        const limit = await planLimitsService.getFeatureLimit(user.planType, feature);
        const description = await planLimitsService.getFeatureDescription(user.planType, feature);
        return { feature, limit, description };
      })
    );

    return NextResponse.json({
      canCreate,
      isLastFree,
      redirectTo,
      limits: limits.reduce((acc, { feature, limit, description }) => {
        acc[feature] = { limit, description };
        return acc;
      }, {} as Record<string, { limit: number; description: string | null }>)
    });
  } catch (error) {
    console.error('Error in /api/subscription/check:', error);
    return NextResponse.json(
      { canCreate: false, isLastFree: false, redirectTo: '/pricing' },
      { status: 500 }
    );
  }
}
