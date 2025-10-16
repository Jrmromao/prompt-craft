'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Zap, TrendingDown, BarChart3 } from 'lucide-react';

interface UsageStats {
  totalRuns: number;
  totalCost: number;
  totalSavings: number;
  monthlyRuns: number;
  monthlyCost: number;
  monthlySavings: number;
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          totalRuns: data.totalRuns || 0,
          totalCost: data.totalCost || 0,
          totalSavings: data.savings?.total || 0,
          monthlyRuns: data.monthlyRuns || 0,
          monthlyCost: data.totalCost || 0,
          monthlySavings: data.savings?.total || 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Usage & Costs</h2>
        <p className="text-gray-600 mt-1">Track your API usage and savings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Total API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalRuns.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-red-500" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats?.totalCost.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="w-5 h-5 text-green-500" />
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${stats?.totalSavings.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">From optimization & routing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-purple-500" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.monthlyRuns.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">API calls</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost this month</span>
              <span className="font-semibold">${stats?.monthlyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saved this month</span>
              <span className="font-semibold text-green-600">${stats?.monthlySavings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-semibold">Without PromptCraft</span>
              <span className="font-semibold text-red-600">
                ${(stats?.monthlyCost + stats?.monthlySavings).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
