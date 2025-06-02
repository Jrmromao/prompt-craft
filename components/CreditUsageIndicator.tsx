import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface CreditUsageIndicatorProps {
  used: number;
  total: number;
  percentage: number;
  periodEnd: Date;
  onUpgrade?: () => void;
}

export function CreditUsageIndicator({
  used,
  total,
  percentage,
  periodEnd,
  onUpgrade,
}: CreditUsageIndicatorProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Credit Usage</h3>
          <span className="text-sm text-muted-foreground">
            {used} / {total} credits
          </span>
        </div>
        
        <Progress
          value={percentage}
          className="h-2"
          style={{
            backgroundColor: getProgressColor(percentage),
          }}
        />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Resets in {formatDistanceToNow(periodEnd)}
          </span>
          
          {percentage >= 75 && (
            <button
              onClick={onUpgrade}
              className="text-primary hover:underline"
            >
              Upgrade for more credits
            </button>
          )}
        </div>
      </div>
    </Card>
  );
} 