'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, DollarSign, Zap, TrendingUp } from 'lucide-react';

interface UsageStats {
  totalRuns: number;
  totalCost: number;
  totalSavings: number;
  monthlyCost?: number;
  monthlySavings?: number;
}

export default function UsagePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats>({
    totalRuns: 0,
    totalCost: 0,
    totalSavings: 0,
  });

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Usage Statistics</h1>
        <p className="text-gray-600">Track your AI usage and costs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Total Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRuns.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">API calls tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalCost.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-1">All-time spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${stats.totalSavings.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Saved with optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Monthly Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(stats.monthlyCost || 0).toFixed(2)}
            </div>
            <p className="text-sm text-green-600 mt-1">
              Saved: ${(stats.monthlySavings || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average cost per run</span>
              <span className="font-semibold">
                ${stats.totalRuns > 0 ? (stats.totalCost / stats.totalRuns).toFixed(4) : '0.0000'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Savings rate</span>
              <span className="font-semibold text-green-600">
                {stats.totalCost > 0 
                  ? ((stats.totalSavings / (stats.totalCost + stats.totalSavings)) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
