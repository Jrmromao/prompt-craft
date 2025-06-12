'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart } from '@/components/ui/charts';

interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  totalPrompts: number;
  totalVersions: number;
  conversionRate: number;
  averageResponseTime: number;
  errorRate: number;
  dailyActiveUsers: number[];
  promptUsageByModel: Record<string, number>;
  errorDistribution: Record<string, number>;
}

export function UsageMetrics() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/admin/metrics?timeRange=${timeRange}`);
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
  }, [timeRange]);

  if (!metrics) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPrompts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalVersions} versions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.conversionRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Version to prompt conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.errorRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time: {metrics.averageResponseTime}ms
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="models">Model Usage</TabsTrigger>
          <TabsTrigger value="errors">Error Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={metrics.dailyActiveUsers.map((value, index) => ({
                  date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                  users: value,
                }))}
                xAxis="date"
                yAxis="users"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Usage by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={Object.entries(metrics.promptUsageByModel).map(([model, count]) => ({
                  model,
                  count,
                }))}
                xAxis="model"
                yAxis="count"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={Object.entries(metrics.errorDistribution).map(([type, count]) => ({
                  type,
                  count,
                }))}
                xAxis="type"
                yAxis="count"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 