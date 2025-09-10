'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Calendar, ShoppingCart } from 'lucide-react';
import { CREDIT_COSTS } from '@/app/constants/creditCosts';

interface CreditUsage {
  monthlyCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  usedThisMonth: number;
  planType: 'FREE' | 'PRO';
  nextResetDate: string;
  recentActivity: Array<{
    operation: string;
    cost: number;
    timestamp: string;
  }>;
}

export default function CreditUsageDashboard() {
  const [usage, setUsage] = useState<CreditUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditUsage();
  }, []);

  const fetchCreditUsage = async () => {
    try {
      const response = await fetch('/api/credits/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch credit usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Failed to load credit usage</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = (usage.usedThisMonth / (usage.monthlyCredits || 1)) * 100;
  const remainingCredits = usage.totalCredits - usage.usedThisMonth;

  return (
    <div className="space-y-6">
      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {usage.monthlyCredits} monthly + {usage.purchasedCredits} purchased
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.usedThisMonth}</div>
            <Progress value={usagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {usagePercentage.toFixed(1)}% of monthly allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={usage.planType === 'PRO' ? 'default' : 'secondary'}>
                {usage.planType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Resets {new Date(usage.nextResetDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Costs Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Credit Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(CREDIT_COSTS).map(([operation, cost]) => (
              <div key={operation} className="text-center p-3 border rounded-lg">
                <div className="font-semibold text-sm">
                  {operation.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-lg font-bold text-purple-600">
                  {cost} {usage.planType === 'PRO' && cost > 1 && (
                    <span className="text-sm text-green-600">
                      ({Math.ceil(cost * 0.8)})
                    </span>
                  )}
                </div>
                {usage.planType === 'PRO' && cost > 1 && (
                  <div className="text-xs text-green-600">20% discount</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {usage.recentActivity && usage.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usage.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{activity.operation}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">-{activity.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Credits */}
      {remainingCredits < 50 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-800">Running Low on Credits</h3>
                <p className="text-sm text-yellow-700">
                  You have {remainingCredits} credits remaining. Consider purchasing more to continue using premium features.
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
