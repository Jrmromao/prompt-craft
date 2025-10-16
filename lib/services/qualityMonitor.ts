import { prisma } from '@/lib/prisma';

interface QualityFeedback {
  runId: string;
  rating: number; // 1-5
  feedback?: string;
}

interface QualityMetrics {
  avgRating: number;
  totalFeedback: number;
  routedAvgRating: number;
  nonRoutedAvgRating: number;
  qualityDrop: number;
  shouldDisableRouting: boolean;
}

export class QualityMonitor {
  private static QUALITY_THRESHOLD = 3.5; // Minimum acceptable rating
  private static QUALITY_DROP_THRESHOLD = 0.5; // Max acceptable drop from routing

  // Submit user feedback on response quality
  static async submitFeedback(
    userId: string,
    runId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    await prisma.qualityFeedback.create({
      data: {
        userId,
        runId,
        rating,
        feedback,
      },
    });

    // Check if we should disable routing
    const metrics = await this.getMetrics(userId);
    if (metrics.shouldDisableRouting) {
      await this.disableRouting(userId);
    }
  }

  // Get quality metrics for a user
  static async getMetrics(userId: string, days: number = 30): Promise<QualityMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all feedback with run details
    const feedback = await prisma.qualityFeedback.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: {
        run: {
          select: {
            model: true,
            requestedModel: true,
          },
        },
      },
    });

    if (feedback.length === 0) {
      return {
        avgRating: 0,
        totalFeedback: 0,
        routedAvgRating: 0,
        nonRoutedAvgRating: 0,
        qualityDrop: 0,
        shouldDisableRouting: false,
      };
    }

    // Calculate metrics
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = totalRating / feedback.length;

    // Separate routed vs non-routed
    const routedFeedback = feedback.filter(
      (f) => f.run.requestedModel && f.run.requestedModel !== f.run.model
    );
    const nonRoutedFeedback = feedback.filter(
      (f) => !f.run.requestedModel || f.run.requestedModel === f.run.model
    );

    const routedAvgRating =
      routedFeedback.length > 0
        ? routedFeedback.reduce((sum, f) => sum + f.rating, 0) / routedFeedback.length
        : 0;

    const nonRoutedAvgRating =
      nonRoutedFeedback.length > 0
        ? nonRoutedFeedback.reduce((sum, f) => sum + f.rating, 0) / nonRoutedFeedback.length
        : 0;

    const qualityDrop = nonRoutedAvgRating - routedAvgRating;

    // Should disable routing if:
    // 1. Routed quality is below threshold
    // 2. Quality drop is too large
    // 3. We have enough data (at least 10 routed responses)
    const shouldDisableRouting =
      routedFeedback.length >= 10 &&
      (routedAvgRating < this.QUALITY_THRESHOLD ||
        qualityDrop > this.QUALITY_DROP_THRESHOLD);

    return {
      avgRating: Math.round(avgRating * 10) / 10,
      totalFeedback: feedback.length,
      routedAvgRating: Math.round(routedAvgRating * 10) / 10,
      nonRoutedAvgRating: Math.round(nonRoutedAvgRating * 10) / 10,
      qualityDrop: Math.round(qualityDrop * 10) / 10,
      shouldDisableRouting,
    };
  }

  // Disable routing for a user
  static async disableRouting(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { smartRoutingEnabled: false },
    });

    // Log the event
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ROUTING_DISABLED',
        resource: 'quality_monitor',
        details: {
          reason: 'Quality drop detected',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  // Re-enable routing for a user
  static async enableRouting(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { smartRoutingEnabled: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ROUTING_ENABLED',
        resource: 'quality_monitor',
        details: {
          reason: 'Manual re-enable',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  // Get routing status
  static async getRoutingStatus(userId: string): Promise<{
    enabled: boolean;
    reason?: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { smartRoutingEnabled: true },
    });

    if (!user) {
      return { enabled: false, reason: 'User not found' };
    }

    if (!user.smartRoutingEnabled) {
      const metrics = await this.getMetrics(userId);
      return {
        enabled: false,
        reason: `Quality drop detected (${metrics.qualityDrop.toFixed(1)} point drop)`,
      };
    }

    return { enabled: true };
  }

  // Compare model performance
  static async compareModels(
    userId: string,
    model1: string,
    model2: string
  ): Promise<{
    model1Avg: number;
    model2Avg: number;
    difference: number;
    recommendation: string;
  }> {
    const feedback = await prisma.qualityFeedback.findMany({
      where: { userId },
      include: {
        run: {
          select: { model: true },
        },
      },
    });

    const model1Feedback = feedback.filter((f) => f.run.model.includes(model1));
    const model2Feedback = feedback.filter((f) => f.run.model.includes(model2));

    const model1Avg =
      model1Feedback.length > 0
        ? model1Feedback.reduce((sum, f) => sum + f.rating, 0) / model1Feedback.length
        : 0;

    const model2Avg =
      model2Feedback.length > 0
        ? model2Feedback.reduce((sum, f) => sum + f.rating, 0) / model2Feedback.length
        : 0;

    const difference = model1Avg - model2Avg;

    let recommendation = '';
    if (Math.abs(difference) < 0.3) {
      recommendation = 'Both models perform similarly. Use cheaper option.';
    } else if (difference > 0) {
      recommendation = `${model1} performs better. Consider using it for important tasks.`;
    } else {
      recommendation = `${model2} performs better. Consider using it for important tasks.`;
    }

    return {
      model1Avg: Math.round(model1Avg * 10) / 10,
      model2Avg: Math.round(model2Avg * 10) / 10,
      difference: Math.round(difference * 10) / 10,
      recommendation,
    };
  }
}
