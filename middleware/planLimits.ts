import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Plan } from '@prisma/client';

interface PlanLimits {
  maxPrompts: number;
  maxTokens: number;
  maxTeamMembers: number;
  features: string[];
  isEnterprise: boolean;
  customLimits?: any;
}

interface UsageMetrics {
  promptCount: number;
  tokenUsage: number;
  teamMemberCount: number;
}

export class PlanLimitsMiddleware {
  private static instance: PlanLimitsMiddleware;
  private cache: Map<string, { limits: PlanLimits; metrics: UsageMetrics; timestamp: number }>;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): PlanLimitsMiddleware {
    if (!PlanLimitsMiddleware.instance) {
      PlanLimitsMiddleware.instance = new PlanLimitsMiddleware();
    }
    return PlanLimitsMiddleware.instance;
  }

  private async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!user?.subscription?.plan) {
      // Return FREE plan limits if no subscription
      const freePlan = await prisma.plan.findUnique({
        where: { name: 'FREE' }
      });
      return this.formatPlanLimits(freePlan!);
    }

    return this.formatPlanLimits(user.subscription.plan);
  }

  private formatPlanLimits(plan: Plan): PlanLimits {
    return {
      maxPrompts: plan.maxPrompts,
      maxTokens: plan.maxTokens,
      maxTeamMembers: plan.maxTeamMembers,
      features: plan.features,
      isEnterprise: plan.isEnterprise,
      customLimits: plan.customLimits
    };
  }

  private async getUserMetrics(userId: string): Promise<UsageMetrics> {
    try {
      const [promptCount, tokenUsage, teamMemberCount] = await Promise.all([
        prisma.prompt.count({ where: { userId } }).catch(() => 0),
        prisma.promptUsage.aggregate({
          where: { userId },
          _sum: { tokenCount: true }
        }).catch(() => ({ _sum: { tokenCount: 0 } })),
        prisma.teamMember.count({ where: { userId } }).catch(() => 0)
      ]);

      return {
        promptCount: promptCount || 0,
        tokenUsage: tokenUsage?._sum?.tokenCount || 0,
        teamMemberCount: teamMemberCount || 0
      };
    } catch (error) {
      console.error('Error getting user metrics:', error);
      return {
        promptCount: 0,
        tokenUsage: 0,
        teamMemberCount: 0
      };
    }
  }

  private async getCachedData(userId: string): Promise<{ limits: PlanLimits; metrics: UsageMetrics } | null> {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { limits: cached.limits, metrics: cached.metrics };
    }
    return null;
  }

  private setCachedData(userId: string, limits: PlanLimits, metrics: UsageMetrics): void {
    this.cache.set(userId, { limits, metrics, timestamp: Date.now() });
  }

  public async checkLimits(
    userId: string,
    requiredFeature?: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Check cache first
      const cached = await this.getCachedData(userId);
      let limits: PlanLimits;
      let metrics: UsageMetrics;

      if (cached) {
        limits = cached.limits;
        metrics = cached.metrics;
      } else {
        // Get fresh data
        [limits, metrics] = await Promise.all([
          this.getUserPlanLimits(userId),
          this.getUserMetrics(userId)
        ]);
        this.setCachedData(userId, limits, metrics);
      }

      // Check feature access
      if (requiredFeature && !limits.isEnterprise && !limits.features.includes(requiredFeature)) {
        return {
          allowed: false,
          reason: `Feature "${requiredFeature}" is not available in your plan`
        };
      }

      // Enterprise plans with custom limits
      if (limits.isEnterprise && limits.customLimits) {
        const customLimits = limits.customLimits as PlanLimits;
        return {
          allowed: true,
          reason: 'Enterprise plan with custom limits'
        };
      }

      // Check prompt limit
      if (limits.maxPrompts > 0 && metrics.promptCount >= limits.maxPrompts) {
        return {
          allowed: false,
          reason: `You have reached your plan's limit of ${limits.maxPrompts} prompts`
        };
      }

      // Check token usage
      if (limits.maxTokens > 0 && metrics.tokenUsage >= limits.maxTokens) {
        return {
          allowed: false,
          reason: `You have reached your plan's limit of ${limits.maxTokens} tokens`
        };
      }

      // Check team member limit
      if (limits.maxTeamMembers > 0 && metrics.teamMemberCount >= limits.maxTeamMembers) {
        return {
          allowed: false,
          reason: `You have reached your plan's limit of ${limits.maxTeamMembers} team members`
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking plan limits:', error);
      return { allowed: false, reason: 'Error checking plan limits' };
    }
  }
}

export async function withPlanLimits(
  req: Request,
  requiredFeature?: string
): Promise<NextResponse | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const middleware = PlanLimitsMiddleware.getInstance();
    const { allowed, reason } = await middleware.checkLimits(userId, requiredFeature);

    if (!allowed) {
      return NextResponse.json(
        { error: reason || 'Plan limit exceeded' },
        { status: 403 }
      );
    }

    return null; // Continue with the request
  } catch (error) {
    console.error('Error in plan limits middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 