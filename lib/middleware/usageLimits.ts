import { SubscriptionService } from '@/lib/services/subscriptionService';

export async function checkUsageLimit(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const subscriptionService = SubscriptionService.getInstance();
  
  const canTrack = await subscriptionService.checkLimit(userId, 'trackedRuns');
  
  if (!canTrack) {
    return {
      allowed: false,
      error: 'Monthly tracked runs limit reached. Please upgrade your plan.',
    };
  }

  return { allowed: true };
}
