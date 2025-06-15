import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TokenCounterProps {
  currentBalance: number;
  creditCap: number;
  planType: string;
  onThresholdReached?: () => void;
}

const TOKEN_THRESHOLDS = {
  warning: 0.8, // 80% of max tokens
  critical: 0.9, // 90% of max tokens
};

export function TokenCounter({
  currentBalance,
  creditCap,
  planType,
  onThresholdReached,
}: TokenCounterProps) {
  const { toast } = useToast();
  const [usagePercentage, setUsagePercentage] = useState(0);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [hasShownCritical, setHasShownCritical] = useState(false);

  useEffect(() => {
    const percentage = ((creditCap - currentBalance) / creditCap) * 100;
    setUsagePercentage(percentage);

    // Show warning toast at 80% usage
    if (percentage >= TOKEN_THRESHOLDS.warning * 100 && !hasShownWarning) {
      toast({
        title: 'High Credit Usage',
        description: `You've used ${Math.round(percentage)}% of your available credits.`,
        variant: 'default',
      });
      setHasShownWarning(true);
      onThresholdReached?.();
    }

    // Show critical toast at 90% usage
    if (percentage >= TOKEN_THRESHOLDS.critical * 100 && !hasShownCritical) {
      toast({
        title: 'Critical Credit Usage',
        description: 'You are approaching your credit limit. Consider upgrading your plan.',
        variant: 'destructive',
      });
      setHasShownCritical(true);
      onThresholdReached?.();
    }
  }, [currentBalance, creditCap, toast, hasShownWarning, hasShownCritical, onThresholdReached]);

  const getProgressColor = () => {
    if (usagePercentage >= TOKEN_THRESHOLDS.critical * 100) return 'bg-red-500';
    if (usagePercentage >= TOKEN_THRESHOLDS.warning * 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Credit Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Current Balance</span>
            <span className="font-medium">
              {currentBalance.toLocaleString()} / {creditCap.toLocaleString()} credits
            </span>
          </div>
          
          <Progress value={usagePercentage} className={getProgressColor()} />
          
          {usagePercentage >= TOKEN_THRESHOLDS.critical * 100 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Usage</AlertTitle>
              <AlertDescription>
                You are approaching your credit limit. Consider upgrading your plan or optimizing your usage.
              </AlertDescription>
            </Alert>
          )}
          
          {usagePercentage >= TOKEN_THRESHOLDS.warning * 100 && usagePercentage < TOKEN_THRESHOLDS.critical * 100 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>High Usage</AlertTitle>
              <AlertDescription>
                You've used {Math.round(usagePercentage)}% of your available credits. Monitor your usage to avoid hitting the limit.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Plan: {planType}</p>
            <p>Usage resets monthly with your subscription</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 