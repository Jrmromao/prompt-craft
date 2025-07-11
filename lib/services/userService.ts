import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PlanType as PrismaPlanType } from '@prisma/client';
import { PlanType } from '@/utils/constants';
import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from "@clerk/nextjs/server";

// Types for serializable props
interface SerializableUserWithPlan {
  id: string;
  clerkId: string;
  email: string;
  username: string;
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

// Helper function to convert Prisma PlanType to our PlanType
function convertPlanType(prismaPlanType: string): PlanType {
  switch (prismaPlanType) {
    case 'FREE':
      return PlanType.FREE;
    case 'PRO':
      return PlanType.PRO;
    // case 'ELITE':
    //   return PlanType.ELITE;
    // case 'ENTERPRISE':
    //   return PlanType.ENTERPRISE;
    default:
      return PlanType.FREE;
  }
}

// Helper function to convert our PlanType to Prisma PlanType
function convertToPrismaPlanType(planType: PlanType): PrismaPlanType {
  switch (planType) {
    case PlanType.FREE:
      return PrismaPlanType.FREE;
    case PlanType.PRO:
      return PrismaPlanType.PRO;
    // case PlanType.ELITE:
    //   return PrismaPlanType.ELITE;
    // case PlanType.ENTERPRISE:
    //   return PrismaPlanType.ENTERPRISE;
    default:
      return PrismaPlanType.FREE;
  }
}

export class UserService {
  private static instance: UserService;
  private userCache: Map<string, { user: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Helper function to validate user ID format
  public isValidUserId(userId: string): boolean {
    return /^user_[a-zA-Z0-9]{10,}$/.test(userId);
  }

  // Helper function to validate email format
  public isValidEmail(email: string): boolean {
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return EMAIL_REGEX.test(email);
  }

  // Helper function to sanitize string inputs
  public sanitizeString(input: string | null | undefined): string {
    if (!input) return '';
    const CONTROL_CHARS = Array.from({ length: 32 }, (_, i) => String.fromCharCode(i))
      .concat(Array.from({ length: 33 }, (_, i) => String.fromCharCode(i + 127)))
      .join('');
    const CONTROL_CHARS_REGEX = new RegExp(`[${CONTROL_CHARS}]`, 'g');

    return input.replace(CONTROL_CHARS_REGEX, '').trim().substring(0, 255);
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
        select: {
          id: true,
          clerkId: true,
          username: true,
          email: true,
          name: true,
          planType: true,
          createdAt: true,
          updatedAt: true,
          lastCreditReset: true,
          subscription: {
            select: {
              // select fields from subscription or use include for plan
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

        // Get the user's plan type from Clerk metadata
        const client = await clerkClient();
        const clerkUserData = await client.users.getUser(clerkId);
        const planType = convertPlanType(clerkUserData.privateMetadata.planType as string || 'FREE');

        // Create new user with email from Clerk
        const newUser = await prisma.user.create({
          data: {
            clerkId,
            email: clerkUser.emailAddresses[0].emailAddress,
            name: clerkUser.firstName || 'User',
            planType: convertToPrismaPlanType(planType),
            monthlyCredits: 10,
            purchasedCredits: 0,
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

        // Set the database ID in Clerk's private metadata
        await this.setUserDatabaseIdInClerk(clerkId, newUser.id, newUser.planType);

        this.userCache.set(clerkId, { user: newUser, timestamp: now });
        return newUser;
      }

      // Update cache
      this.userCache.set(clerkId, { user, timestamp: now });
      return user;
    } catch (error) {
      console.error('User fetch error:', error instanceof Error ? error.message : 'Unknown error');
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

    const usageData = await prisma.promptGeneration.groupBy({
      by: ['createdAt'],
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        creditsUsed: true,
      },
    });

    return usageData.map(data => ({
      date: data.createdAt.toISOString().split('T')[0],
      credits: data._sum.creditsUsed || 0,
    }));
  }

  // Helper function to create or update a user
  public async createOrUpdateUser(
    clerkUserId: string,
    email: string,
    firstName: string | null,
    lastName: string | null
  ): Promise<boolean> {
    if (!this.isValidUserId(clerkUserId)) {
      console.error(`Invalid Clerk user ID format: ${clerkUserId}`);
      return false;
    }

    if (!this.isValidEmail(email)) {
      console.error(`Invalid email format: ${email}`);
      return false;
    }

    const sanitizedFirstName = this.sanitizeString(firstName);
    const sanitizedLastName = this.sanitizeString(lastName);

    const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim() || 'User';
    try {
      await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          name: fullName,
        },
      });

      console.log(`User operation successful for clerk ID: ${clerkUserId.substring(0, 8)}...`);
      return true;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error(`Database error processing user: ${error.code}`);
      } else {
        console.error(
          'Error in user operation:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
      return false;
    }
  }

  public async setUserDatabaseIdInClerk(clerkId: string, databaseId: string, planType: string) {
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkId, {
        privateMetadata: {
          databaseId,
          planType: convertToPrismaPlanType(convertPlanType(planType))
        }
      });
    } catch (error) {
      console.error('Error setting database ID in Clerk metadata:', error);
      throw error;
    }
  }

  public async getDatabaseIdFromClerk(clerkId: string): Promise<string | null> {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkId);
      return user.privateMetadata.databaseId as string || null;
    } catch (error) {
      console.error('Error getting database ID from Clerk metadata:', error);
      return null;
    }
  }

  public async getPlanTypeFromClerk(clerkId: string): Promise<PlanType | null> {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkId);
      const planType = user.privateMetadata.planType as string;
      return planType ? convertPlanType(planType) : null;
    } catch (error) {
      console.error('Error getting plan type from Clerk metadata:', error);
      return null;
    }
  }
}
