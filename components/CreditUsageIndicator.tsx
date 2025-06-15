import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function CreditUsageIndicator() {
  const { balance, isLoading, error } = useCreditBalance();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </Card>
    );
  }

  if (error || !balance) {
    return null;
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <TooltipProvider>
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Credits</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground cursor-help">
                  {balance.totalCredits} total
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p>Monthly: {balance.monthlyCredits}</p>
                  <p>Purchased: {balance.purchasedCredits}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Monthly</span>
              <span>{balance.monthlyCredits} / {balance.usage.monthlyTotal}</span>
            </div>
            <Progress
              value={balance.usage.monthlyPercentage}
              className="h-1.5"
              style={{
                backgroundColor: getProgressColor(balance.usage.monthlyPercentage),
              }}
            />
          </div>

          {balance.purchasedCredits > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Purchased</span>
                <span>{balance.purchasedCredits}</span>
              </div>
              <Progress
                value={100}
                className="h-1.5 bg-blue-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Resets in {formatDistanceToNow(new Date(balance.usage.nextResetDate))}
            </span>
            {balance.usage.monthlyPercentage >= 75 && (
              <a 
                href="/credits" 
                className="text-primary hover:underline"
              >
                Get more credits
              </a>
            )}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
