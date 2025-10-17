import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';

interface PlanLimits {
  maxAISpend: number; // Monthly AI spend limit in dollars
  dataRetentionDays: number;
  teamMembers: number;
  features: {
    caching: boolean;
    emailAlerts: boolean;
    promptOptimization: boolean;
    qualityMonitoring: boolean;
    prioritySupport: boolean;
    sso: boolean;
    customIntegrations: boolean;
    sla: boolean;
  };
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    maxAISpend: 100,
    dataRetentionDays: 7,
    teamMembers: 1,
    features: {
      caching: false,
      emailAlerts: false,
      promptOptimization: false,
      qualityMonitoring: false,
      prioritySupport: false,
      sso: false,
      customIntegrations: false,
      sla: false,
    },
  },
  STARTER: {
    maxAISpend: 500,
    dataRetentionDays: 30,
    teamMembers: 1,
    features: {
      caching: true,
      emailAlerts: true,
      promptOptimization: false,
      qualityMonitoring: false,
      prioritySupport: false,
      sso: false,
      customIntegrations: false,
      sla: false,
    },
  },
  PRO: {
    maxAISpend: 2000,
    dataRetentionDays: 90,
    teamMembers: 5,
    features: {
      caching: true,
      emailAlerts: true,
      promptOptimization: true,
      qualityMonitoring: true,
      prioritySupport: true,
      sso: false,
      customIntegrations: false,
      sla: false,
    },
  },
  ENTERPRISE: {
    maxAISpend: Infinity,
    dataRetentionDays: 365,
    teamMembers: Infinity,
    features: {
      caching: true,
      emailAlerts: true,
      promptOptimization: true,
      qualityMonitoring: true,
      prioritySupport: true,
      sso: true,
      customIntegrations: true,
      sla: true,
    },
  },
};

export async function checkPlanLimit(
  userId: string,
  feature: keyof PlanLimits['features']
): Promise<{ allowed: boolean; reason?: string; upgradeUrl?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  const limits = PLAN_LIMITS[user.planType];

  if (!limits.features[feature]) {
    return {
      allowed: false,
      reason: `${feature} is not available on your ${user.planType} plan`,
      upgradeUrl: '/pricing',
    };
  }

  return { allowed: true };
}

export async function checkAISpendLimit(userId: string): Promise<{
  allowed: boolean;
  currentSpend: number;
  limit: number;
  percentUsed: number;
  reason?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  });

  if (!user) {
    return {
      allowed: false,
      currentSpend: 0,
      limit: 0,
      percentUsed: 0,
      reason: 'User not found',
    };
  }

  const limits = PLAN_LIMITS[user.planType];

  // Get current month's spend
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlySpend = await prisma.promptRun.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
    _sum: { cost: true },
  });

  const currentSpend = monthlySpend._sum.cost || 0;
  const percentUsed = (currentSpend / limits.maxAISpend) * 100;

  if (currentSpend >= limits.maxAISpend) {
    return {
      allowed: false,
      currentSpend,
      limit: limits.maxAISpend,
      percentUsed,
      reason: `You've reached your ${user.planType} plan limit of $${limits.maxAISpend}/month. Upgrade to continue tracking.`,
    };
  }

  return {
    allowed: true,
    currentSpend,
    limit: limits.maxAISpend,
    percentUsed,
  };
}

export async function checkDataRetention(userId: string, date: Date): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  });

  if (!user) return false;

  const limits = PLAN_LIMITS[user.planType];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - limits.dataRetentionDays);

  return date >= cutoffDate;
}

export async function checkTeamMemberLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  });

  if (!user) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const limits = PLAN_LIMITS[user.planType];

  const teamMemberCount = await prisma.teamMember.count({
    where: { userId },
  });

  return {
    allowed: teamMemberCount < limits.teamMembers,
    current: teamMemberCount,
    limit: limits.teamMembers,
  };
}
