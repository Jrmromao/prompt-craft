import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export class AnalyticsTrackingService {
  private static instance: AnalyticsTrackingService;

  private constructor() {}

  public static getInstance(): AnalyticsTrackingService {
    if (!AnalyticsTrackingService.instance) {
      AnalyticsTrackingService.instance = new AnalyticsTrackingService();
    }
    return AnalyticsTrackingService.instance;
  }

  // Track a prompt view
  public async trackPromptView(promptId: string, userId?: string): Promise<void> {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') ?? undefined;
    const ipAddress = headersList.get('x-forwarded-for') ?? undefined;

    await prisma.$transaction(async (tx) => {
      // Create view record
      await tx.promptView.create({
        data: {
          promptId,
          userId,
          userAgent,
          ipAddress,
        },
      });

      // Update prompt view count
      await tx.prompt.update({
        where: { id: promptId },
        data: {
          viewCount: {
            increment: 1,
          },
          lastViewedAt: new Date(),
        },
      });
    });
  }

  // Track prompt usage
  public async trackPromptUsage(
    promptId: string,
    userId: string,
    result: any
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Create usage record
      await tx.promptUsage.create({
        data: {
          promptId,
          userId,
          result,
        },
      });

      // Update prompt usage count
      await tx.prompt.update({
        where: { id: promptId },
        data: {
          usageCount: {
            increment: 1,
          },
          lastUsedAt: new Date(),
        },
      });
    });
  }

  // Track a prompt copy (unique per user/IP per hour)
  public async trackPromptCopy(promptId: string, userId?: string): Promise<void> {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') ?? undefined;
    const ipAddress = headersList.get('x-forwarded-for') ?? undefined;
    const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);
    let dbUserId: string | undefined = undefined;
    if (userId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });
      dbUserId = dbUser?.id;
    }
    const recentCopy = await prisma.promptCopy.findFirst({
      where: {
        promptId,
        OR: [
          { userId: dbUserId ?? undefined },
          { ipAddress },
        ],
        createdAt: { gte: oneHourAgo },
      },
    });
    if (!recentCopy) {
      await prisma.$transaction(async (tx) => {
        await tx.promptCopy.create({
          data: {
            promptId,
            userId: dbUserId,
            ipAddress,
            userAgent,
          },
        });
        await tx.prompt.update({
          where: { id: promptId },
          data: {
            copyCount: { increment: 1 },
          },
        });
      });
    }
  }
} 