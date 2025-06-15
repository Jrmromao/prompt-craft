import React from 'react';
import { TokenCounter } from './TokenCounter';
import { CreditUsageHistory } from './CreditUsageHistory';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';

export function TokenUsageDashboard() {
  const { user, isLoaded } = useUser();
  const { tokenUsage, isLoading, error } = useTokenUsage(user?.id || '');

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!user || error || !tokenUsage) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive">
        <p>Failed to load credit usage data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TokenCounter
        currentBalance={tokenUsage.currentBalance}
        creditCap={tokenUsage.creditCap}
        planType={tokenUsage.planType}
      />
      
      <CreditUsageHistory
        records={tokenUsage.recentActivity.map(activity => ({
          id: activity.id,
          date: activity.createdAt,
          type: activity.type,
          amount: activity.amount,
          description: activity.description,
        }))}
        className="mt-6"
      />
    </div>
  );
} 