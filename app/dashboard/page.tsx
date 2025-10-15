'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Zap, DollarSign, TrendingUp, BarChart3, AlertCircle, Activity, Clock, Settings } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRuns: number;
  monthlyRuns: number;
  monthlyLimit: number;
  totalCost: number;
  avgCostPerRun: number;
  avgLatency: number;
  totalTokens: number;
  successRate: number;
  plan: string;
  savings: {
    total: number;
    smartRouting: number;
    caching: number;
    routedCount: number;
    roi: number;
  };
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setLoading(false);
      });
  }, []);

  const percentUsed = stats ? (stats.monthlyRuns / stats.monthlyLimit) * 100 : 0;
  const isNearLimit = percentUsed > 80;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Track your AI costs and optimize spending</p>
        </div>
        <div className="flex gap-2">
          <Link href="/settings">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href="/analytics">
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Savings Banner */}
      {stats && stats.savings.total > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">💰 Real Savings This Month</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-500 mb-2">
                  ${stats.savings.total.toFixed(2)}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Smart Routing: ${stats.savings.smartRouting.toFixed(2)} ({stats.savings.routedCount} prompts)</span>
                  <span>Caching: ${stats.savings.caching.toFixed(2)}</span>
                </div>
              </div>
              {stats.plan === 'FREE' && stats.savings.total > 50 && (
                <div className="text-right">
                  <p className="text-sm font-medium mb-2">Upgrade to Pro and save 2x more!</p>
                  <Link href="/pricing">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      Upgrade to Pro - Save $500+/month
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Banner - Show if near limit or on free plan */}
      {stats && (isNearLimit || stats.plan === 'FREE') && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  <h2 className="text-xl font-bold">
                    {isNearLimit ? 'Running Low on Runs' : 'Upgrade to Track More'}
                  </h2>
                </div>
                <p className="text-blue-100">
                  {isNearLimit 
                    ? `You've used ${stats.monthlyRuns.toLocaleString()} of ${stats.monthlyLimit.toLocaleString()} runs this month.`
                    : `You're on the ${stats.plan} plan. Upgrade for unlimited tracking.`
                  }
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>100k+ runs/month</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Cost optimization</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Advanced analytics</span>
                  </div>
                </div>
              </div>
              <Link href="/pricing">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tracked Runs"
            value={`${stats.monthlyRuns.toLocaleString()}/${stats.monthlyLimit === -1 ? '∞' : stats.monthlyLimit.toLocaleString()}`}
            icon={<Activity className="w-4 h-4 text-blue-600" />}
            subtitle="This month"
          />
          <StatCard
            title="Total Cost"
            value={`$${stats.totalCost.toFixed(2)}`}
            icon={<DollarSign className="w-4 h-4 text-green-600" />}
            subtitle="All time"
          />
          <StatCard
            title="Avg Cost/Run"
            value={`$${stats.avgCostPerRun.toFixed(4)}`}
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            subtitle="Per API call"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={<BarChart3 className="w-4 h-4 text-orange-600" />}
            subtitle={`${stats.totalRuns} total runs`}
          />
        </div>
      ) : (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Failed to load stats</p>
                <p className="text-sm text-red-700">Please refresh the page</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started - Show if no runs */}
      {stats && stats.totalRuns === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚀 Get Started in 2 Minutes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Step number={1} title="Install SDK" completed={false}>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">npm install promptcraft-sdk</code>
              </Step>
              <Step number={2} title="Get API Key" completed={false}>
                <Link href="/settings" className="text-blue-600 hover:underline text-sm">
                  Go to Settings → Create API Key
                </Link>
              </Step>
              <Step number={3} title="Add to Your Code" completed={false}>
                <Link href="/docs/quickstart" className="text-blue-600 hover:underline text-sm">
                  View Quick Start Guide →
                </Link>
              </Step>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity - Show if has runs */}
      {stats && stats.totalRuns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Tokens Used</span>
              <span className="font-semibold">{stats.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-semibold">{Math.round(stats.avgLatency)}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Plan</span>
              <span className="font-semibold">{stats.plan}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: string; icon: React.ReactNode; subtitle: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function Step({ number, title, completed, children }: { number: number; title: string; completed: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
        {number}
      </div>
      <div className="flex-1">
        <p className="font-medium mb-1">{title}</p>
        {children}
      </div>
    </div>
  );
}
