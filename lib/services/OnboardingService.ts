import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';

interface OnboardingStep {
  step: string;
  completed: boolean;
  metadata?: Record<string, any>;
}

export class OnboardingService {
  private static instance: OnboardingService;

  private constructor() {}

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  async trackStep(userId: string, step: string, completed: boolean, metadata?: Record<string, any>): Promise<void> {
    try {
      await prisma.userOnboarding.upsert({
        where: {
          userId_step: {
            userId,
            step,
          },
        },
        update: {
          completed,
          metadata: metadata ? JSON.stringify(metadata) : null,
          updatedAt: new Date(),
        },
        create: {
          userId,
          step,
          completed,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (error) {
      throw new ServiceError('Failed to track onboarding step', 'ONBOARDING_TRACK_FAILED', 500);
    }
  }

  async getProgress(userId: string): Promise<OnboardingStep[]> {
    try {
      const steps = await prisma.userOnboarding.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      return steps.map(step => ({
        step: step.step,
        completed: step.completed,
        metadata: step.metadata ? JSON.parse(step.metadata) : undefined,
      }));
    } catch (error) {
      throw new ServiceError('Failed to get onboarding progress', 'ONBOARDING_PROGRESS_FAILED', 500);
    }
  }

  async isCompleted(userId: string): Promise<boolean> {
    try {
      const requiredSteps = ['profile_setup', 'plan_selection', 'first_prompt'];
      const completedSteps = await prisma.userOnboarding.count({
        where: {
          userId,
          step: { in: requiredSteps },
          completed: true,
        },
      });

      return completedSteps === requiredSteps.length;
    } catch (error) {
      throw new ServiceError('Failed to check onboarding completion', 'ONBOARDING_CHECK_FAILED', 500);
    }
  }
}
