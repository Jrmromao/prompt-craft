import { prisma } from '@/lib/prisma';

export class ExportService {
  static async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        PromptRuns: true,
        ApiKey: true,
        Subscription: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        plan: user.plan,
      },
      promptRuns: user.PromptRuns.map(run => ({
        id: run.id,
        provider: run.provider,
        model: run.model,
        tokensUsed: run.tokensUsed,
        cost: run.cost,
        success: run.success,
        createdAt: run.createdAt,
      })),
      apiKeys: user.ApiKey.map(key => ({
        id: key.id,
        name: key.name,
        createdAt: key.createdAt,
      })),
      subscription: user.Subscription ? {
        plan: user.Subscription.plan,
        status: user.Subscription.status,
        createdAt: user.Subscription.createdAt,
      } : null,
    };
  }
}
