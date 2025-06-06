import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';
import { subDays, format } from 'date-fns';
import { userUpdateSchema } from '@/lib/validations/user';

/**
 * Fetches a user profile by Clerk ID.
 * @param clerkId Clerk user ID
 * @returns User object or null if not found
 */
export async function getProfileByClerkId(clerkId: string): Promise<User | null> {
  if (!clerkId) throw new Error('Clerk ID is required');
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });
  return user;
}

export type UsageStats = {
  totalCreditsUsed: number;
  creditsRemaining: number;
  creditCap: number;
  lastCreditReset: Date;
  totalRequests: number;
  dailyUsage: { date: string; used: number }[];
  recentActivity: { date: string; description: string | null; amount: number; type: string }[];
};

/**
 * Fetches usage stats and daily usage for the user by Clerk ID.
 */
export async function getUsageStatsByClerkId(clerkId: string): Promise<UsageStats | null> {
  if (!clerkId) throw new Error('Clerk ID is required');
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!user) return null;

  // Assume lastCreditReset is tracked on the user
  const since = user.lastCreditReset || subDays(new Date(), 30);
  const now = new Date();

  // Get all credit history since last reset
  const creditHistory = await prisma.creditHistory.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: since, lte: now },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Aggregate daily usage
  const days = 30;
  const dailyUsage: { date: string; used: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const used = creditHistory
      .filter(h => format(h.createdAt, 'yyyy-MM-dd') === dayStr)
      .reduce((sum, h) => sum + Math.abs(h.amount), 0);
    dailyUsage.push({ date: dayStr, used });
  }

  const totalCreditsUsed = creditHistory.reduce((sum, h) => sum + Math.abs(h.amount), 0);
  const creditsRemaining = user.creditCap - user.credits;
  const totalRequests = creditHistory.length;

  // Recent activity (last 15, newest first)
  const recent = await prisma.creditHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });
  const recentActivity = recent.map(h => ({
    date: h.createdAt.toISOString(),
    description: h.description,
    amount: h.amount,
    type: h.type,
  }));

  return {
    totalCreditsUsed,
    creditsRemaining,
    creditCap: user.creditCap,
    lastCreditReset: user.lastCreditReset || new Date(),
    totalRequests,
    dailyUsage,
    recentActivity,
  };
}

export async function updateProfile(clerkId: string, data: Partial<User>): Promise<User> {
  // Validate the update data
  const validatedData = userUpdateSchema.parse(data);

  return prisma.user.update({
    where: { clerkId },
    data: validatedData,
  });
}

export type { User };
