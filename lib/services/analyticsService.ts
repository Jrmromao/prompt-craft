import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
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

  // Get prompt analytics
  public async getPromptAnalytics(promptId: string) {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: {
        id: true,
        name: true,
        description: true,
        upvotes: true,
        viewCount: true,
        usageCount: true,
        lastViewedAt: true,
        lastUsedAt: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    if (!prompt) {
      return null;
    }

    // Get recent views
    const recentViews = await prisma.promptView.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        userId: true,
      },
    });

    // Get user details for views
    const viewUsers = await prisma.user.findMany({
      where: {
        id: {
          in: recentViews.map(view => view.userId).filter((id): id is string => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });

    // Map views with user details
    const viewsWithUsers = recentViews.map(view => ({
      id: view.id,
      createdAt: view.createdAt,
      user: view.userId ? viewUsers.find(u => u.id === view.userId) : undefined,
    }));

    // Get recent usages
    const recentUsages = await prisma.promptUsage.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        result: true,
        userId: true,
      },
    });

    // Get user details for usages
    const usageUsers = await prisma.user.findMany({
      where: {
        id: {
          in: recentUsages.map(usage => usage.userId),
        },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });

    // Map usages with user details
    const usagesWithUsers = recentUsages.map(usage => ({
      id: usage.id,
      createdAt: usage.createdAt,
      result: usage.result,
      user: usageUsers.find(u => u.id === usage.userId),
    }));

    return {
      ...prompt,
      recentViews: viewsWithUsers,
      recentUsages: usagesWithUsers,
    };
  }

  // Get user's prompt analytics
  public async getUserPromptAnalytics(userId: string) {
    const prompts = await prisma.prompt.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        viewCount: true,
        usageCount: true,
        upvotes: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return prompts.map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
      views: prompt.viewCount,
      uses: prompt.usageCount,
      upvotes: prompt.upvotes,
      comments: prompt._count.comments,
      votes: prompt._count.votes,
    }));
  }
} 