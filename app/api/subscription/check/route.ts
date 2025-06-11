export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@/utils/constants';

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

    // If no subscription, use FREE plan limits
    const plan = user.subscription?.plan || await prisma.plan.findUnique({
      where: { name: 'FREE' }
    });

    if (!plan) {
      return NextResponse.json(
        { canCreate: false, isLastFree: false, redirectTo: '/pricing' },
        { status: 404 }
      );
    }

    // Enterprise plans have custom limits
    if (plan.isEnterprise && plan.customLimits) {
      const customLimits = plan.customLimits as any;
      return NextResponse.json({
        canCreate: true,
        isLastFree: false,
        redirectTo: null,
        limits: customLimits
      });
    }

    // Count prompts created by the user
    const promptCount = await prisma.prompt.count({ where: { userId: user.id } });

    // Check if user can create more prompts
    const canCreate = plan.maxPrompts === 0 || promptCount < plan.maxPrompts;
    const isLastFree = plan.maxPrompts > 0 && promptCount === plan.maxPrompts - 1;
    const redirectTo = canCreate ? null : '/pricing';

    return NextResponse.json({
      canCreate,
      isLastFree,
      redirectTo,
      limits: {
        maxPrompts: plan.maxPrompts,
        maxTokens: plan.maxTokens,
        maxTeamMembers: plan.maxTeamMembers,
        features: plan.features
      }
    });
  } catch (error) {
    console.error('Error in /api/subscription/check:', error);
    return NextResponse.json(
      { canCreate: false, isLastFree: false, redirectTo: '/pricing' },
      { status: 500 }
    );
  }
}
