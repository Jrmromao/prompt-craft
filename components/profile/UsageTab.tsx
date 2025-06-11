import { useUsageMetrics } from '@/hooks/useUsageMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface UsageMetrics {
  promptCount: number;
  tokenUsage: number;
  teamMemberCount: number;
  usageByDay: { date: string; count: number }[];
  usageByFeature: { feature: string; count: number }[];
  tokenUsageByDay: { date: string; tokens: number }[];
  status: string;
  message: string;
  lastUsedAt: string | Date;
}

interface UsageData {
  metrics: UsageMetrics;
  limits: {
    maxPrompts: number;
    maxTokens: number;
    maxTeamMembers: number;
    features: string[];
  };
  usagePercentages: {
    prompts: number;
    tokens: number;
    teamMembers: number;
  };
}

export function UsageTab() {
  const { data, loading, error } = useUsageMetrics();

  if (loading) {
    return <UsageTabSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading usage metrics: {error}
      </div>
    );
  }

  const { metrics, limits, usagePercentages } = data as UsageData;

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <UsageCard
          title="Prompts"
          current={metrics.promptCount}
          limit={limits.maxPrompts}
          percentage={usagePercentages.prompts}
        />
        <UsageCard
          title="Tokens"
          current={metrics.tokenUsage}
          limit={limits.maxTokens}
          percentage={usagePercentages.tokens}
          formatValue={(value) => `${value.toLocaleString()} tokens`}
        />
        <UsageCard
          title="Team Members"
          current={metrics.teamMemberCount}
          limit={limits.maxTeamMembers}
          percentage={usagePercentages.teamMembers}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.usageByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.tokenUsageByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} tokens`, 'Usage']} />
                  <Line
                    type="monotone"
                    dataKey="tokens"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.usageByFeature}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {limits.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center space-x-2 rounded-lg border p-3"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageCard({
  title,
  current,
  limit,
  percentage,
  formatValue = (value) => value.toLocaleString(),
}: {
  title: string;
  current: number;
  limit: number;
  percentage: number;
  formatValue?: (value: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatValue(current)}</span>
            <span className="text-muted-foreground">
              of {formatValue(limit)}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function UsageTabSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 