'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

interface MissedSavingsWidgetProps {
  currentPlan: string;
  monthlySpend: number;
  totalRuns: number;
}

export function MissedSavingsWidget({ currentPlan, monthlySpend, totalRuns }: MissedSavingsWidgetProps) {
  if (currentPlan === 'ENTERPRISE' || currentPlan === 'PRO') return null;

  const missedCachingSavings = currentPlan === 'FREE' ? monthlySpend * 0.35 : 0;
  const missedOptimizationSavings = currentPlan !== 'PRO' ? monthlySpend * 0.25 : 0;
  const totalMissed = missedCachingSavings + missedOptimizationSavings;

  if (totalMissed < 5) return null;

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-1">
              You're Losing ${totalMissed.toFixed(2)}/month
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
              Unlock these savings by upgrading:
            </p>
            <div className="space-y-2 mb-4">
              {missedCachingSavings > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 dark:text-orange-200">
                    <strong>${missedCachingSavings.toFixed(2)}</strong> from smart caching
                  </span>
                </div>
              )}
              {missedOptimizationSavings > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 dark:text-orange-200">
                    <strong>${missedOptimizationSavings.toFixed(2)}</strong> from prompt optimization
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/pricing">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Unlock Savings Now
                </Button>
              </Link>
              <span className="text-xs text-orange-600 font-medium">
                ROI in {Math.ceil((currentPlan === 'FREE' ? 19 : 49) / totalMissed)} days
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
