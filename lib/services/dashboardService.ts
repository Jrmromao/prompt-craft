import { prisma } from '@/lib/prisma';
import { Role, PlanType, Period, CreditType } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { Role as RoleConstant } from '@/utils/constants';

// Types for serializable props
interface SerializableUserWithPlan {
  id: string;
  clerkId: string;
  email: string;
  credits: number;
  plan: {
    id: string;
    name: string;
    features: string[];
    price: number;
    createdAt: string;
    updatedAt: string;
    credits: number;
    creditCap: number;
    type: string;
    period: string;
    isActive: boolean;
  } | null;
  name: string;
  role: string;
  planType: string;
  createdAt: string;
  updatedAt: string;
  creditCap: number;
  lastCreditReset: string;
}

interface SerializablePrompt {
  id: string;
  name: string;
  content: string;
  metadata: any;
  promptType: string;
  description: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializableCreditHistory {
  id: string;
  createdAt: string;
  type: string;
  description: string;
  userId: string;
  amount: number;
}

interface UsageData {
  date: string;
  credits: number;
}

export class DashboardService {
  private static instance: DashboardService;
  private userCache: Map<string, { user: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  private async getUser(clerkId: string) {
    if (!clerkId) {
      throw new Error('Clerk ID is required');
    }

    // Check cache first
    const cached = this.userCache.get(clerkId);
    const now = Date.now();
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.user;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!user) {
        // Get user data from Clerk
        const clerkUser = await currentUser();
        if (!clerkUser) {
          throw new Error('User not authenticated');
        }

        if (!clerkUser.emailAddresses?.[0]?.emailAddress) {
          throw new Error('Could not fetch user email from Clerk');
        }

        // Create new user with email from Clerk
        const newUser = await prisma.user.create({
          data: {
            clerkId,
            email: clerkUser.emailAddresses[0].emailAddress,
            name: clerkUser.firstName || 'User',
            planType: PlanType.FREE,
            credits: 10,
            creditCap: 10,
            lastCreditReset: new Date(),
          },
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        });
        this.userCache.set(clerkId, { user: newUser, timestamp: now });
        return newUser;
      }

      // Update cache
      this.userCache.set(clerkId, { user, timestamp: now });
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch or create user data');
    }
  }

  public async getUserData(clerkId: string): Promise<SerializableUserWithPlan> {
    const user = await this.getUser(clerkId);

    return {
      ...user,
      name: user.name || 'User',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastCreditReset: user.lastCreditReset.toISOString(),
      plan: user.subscription?.plan
        ? {
            ...user.subscription.plan,
            createdAt: user.subscription.plan.createdAt.toISOString(),
            updatedAt: user.subscription.plan.updatedAt.toISOString(),
            type: user.subscription.plan.type,
            period: user.subscription.plan.period,
          }
        : null,
    };
  }

  public async getRecentPrompts(clerkId: string): Promise<any[]> {
    const user = await this.getUser(clerkId);
    const promptGenerations = await prisma.promptGeneration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return promptGenerations.map(gen => ({
      id: gen.id,
      input: gen.input,
      output: gen.output,
      model: gen.promptType, // treat promptType as model for now
      creditsUsed: gen.creditsUsed,
      createdAt: gen.createdAt.toISOString(),
    }));
  }

  public async getCreditHistory(clerkId: string): Promise<SerializableCreditHistory[]> {
    const user = await this.getUser(clerkId);

    const creditHistory = await prisma.creditHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return creditHistory.map(history => ({
      ...history,
      createdAt: history.createdAt.toISOString(),
      description: history.description || '',
      type: history.type,
    }));
  }

  public async getUsageData(clerkId: string): Promise<UsageData[]> {
    const user = await this.getUser(clerkId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const promptGenerations = await prisma.promptGeneration.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        creditsUsed: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group prompts by date and sum credits
    const usageByDate = promptGenerations.reduce((acc: Record<string, number>, generation) => {
      const date = generation.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + generation.creditsUsed;
      return acc;
    }, {});

    // Fill in missing dates with 0
    const usageData: UsageData[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      usageData.unshift({
        date: dateStr,
        credits: usageByDate[dateStr] || 0,
      });
    }

    return usageData;
  }
}
