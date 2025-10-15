'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Zap, Clock, CheckCircle } from 'lucide-react';
import { OverviewCards } from './OverviewCards';
import { CostChart } from './CostChart';
import { ModelBreakdown } from './ModelBreakdown';
import { ExpensivePrompts } from './ExpensivePrompts';
import { PeriodSelector } from './PeriodSelector';

interface AnalyticsData {
  overview: {
    totalRuns: number;
    totalCost: number;
    totalTokens: number;
    avgCostPerRun: number;
    successRate: number;
    avgLatency: number;
    periodComparison: {
      runs: number;
      cost: number;
    };
  };
  modelBreakdown: Array<{
    model: string;
    runs: number;
    cost: number;
    tokens: number;
    avgCost: number;
    successRate: number;
  }>;
  timeSeries: Array<{
    date: string;
    runs: number;
    cost: number;
    tokens: number;
    successRate: number;
  }>;
  expensivePrompts: Array<{
    promptId: string;
    title: string;
    totalCost: number;
    runs: number;
    avgCost: number;
  }>;
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/overview?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No data yet. Connect your API key to get started.</p>
        <a href="/settings/integrations" className="text-purple-600 hover:underline">
          Connect API Key →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PeriodSelector value={period} onChange={setPeriod} />
      
      <OverviewCards data={data.overview} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostChart data={data.timeSeries} />
        <ModelBreakdown data={data.modelBreakdown} />
      </div>
      
      <ExpensivePrompts data={data.expensivePrompts} />
    </div>
  );
}
