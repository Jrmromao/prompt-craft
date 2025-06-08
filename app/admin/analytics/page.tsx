import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsService } from '@/lib/services/analyticsService';
import AnalyticsCharts from './components/AnalyticsCharts';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Activity, TrendingUp, BarChart2, Clock, Star, Copy } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';

// Mark this page as dynamic
export const dynamic = 'force-dynamic';

// Type definitions
interface User {
  name: string | null;
}

interface Prompt {
  name: string;
  user?: User;
}

interface RecentActivity {
  id: string;
  createdAt: string;
  user?: User;
  prompt?: Prompt;
}

interface DashboardOverview {
  totalPromptViews: number;
  totalPromptCopies: number;
  mostPopularPrompt: {
    user?: User;
  } | null;
  mostActiveUser: {
    name: string | null;
  } | null;
  growthRate: string;
  recentActivity: {
    usages: RecentActivity[];
    views: RecentActivity[];
    copies: RecentActivity[];
  };
}

interface AnalyticsData {
  totalUsers: number;
  totalPrompts: number;
  totalGenerations: number;
  userGrowth: any[]; // TODO: Define proper type
  promptUsage: any[]; // TODO: Define proper type
  planDistribution: any[]; // TODO: Define proper type
  dashboardOverview: DashboardOverview;
}

// Loading component
function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Error component
function AnalyticsError({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
      <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
        Error Loading Analytics
      </h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>
    </div>
  );
}

async function getAnalytics(): Promise<AnalyticsData> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const analyticsService = AnalyticsService.getInstance();
    const data = await analyticsService.getAnalytics({
      period: 'daily',
      type: 'all',
      userId,
    });

    // Calculate growth rate
    const growthRate =
      data.dashboardOverview.totalPromptViews > 0
        ? (
            (data.dashboardOverview.totalPromptCopies / data.dashboardOverview.totalPromptViews) *
            100
          ).toFixed(1)
        : 0;

    return {
      totalUsers: data.totalUsers,
      totalPrompts: data.totalPrompts,
      totalGenerations: data.totalGenerations,
      userGrowth: [], // This will be populated from a separate endpoint if needed
      promptUsage: [], // This will be populated from a separate endpoint if needed
      planDistribution: [], // This will be populated from a separate endpoint if needed
      dashboardOverview: {
        ...data.dashboardOverview,
        growthRate: `${growthRate}%`,
        recentActivity: {
          usages: data.dashboardOverview.recentActivity.usages || [],
          views: [], // This will be populated from a separate endpoint if needed
          copies: [], // This will be populated from a separate endpoint if needed
        },
      },
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error; // Let the error boundary handle it
  }
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card
      className={`border-${color}-200 bg-${color}-50 dark:border-${color}-900 dark:bg-${color}-950`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={`flex items-center gap-2 text-sm font-medium text-${color}-700 dark:text-${color}-300`}
        >
          <Icon className="h-5 w-5" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${color}-900 dark:text-${color}-100`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Component
function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Prompt Usages</h3>
            <ul className="space-y-2">
              {activities.map(activity => (
                <li key={activity.id} className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{activity.user?.name ?? 'Unknown'}</span> used{' '}
                  <span className="font-medium">{activity.prompt?.name ?? 'Prompt'}</span>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  return (
    <ErrorBoundary fallback={<AnalyticsError error={new Error('Failed to load analytics')} />}>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </ErrorBoundary>
  );
}

async function AnalyticsContent() {
  const analytics = await getAnalytics();
  const { dashboardOverview } = analytics;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track platform growth and usage metrics
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <BarChart2 className="mr-2 h-4 w-4" />
          Live Analytics
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Users" value={analytics.totalUsers} icon={Users} color="blue" />
        <MetricCard
          title="Total Prompts"
          value={analytics.totalPrompts}
          icon={FileText}
          color="green"
        />
        <MetricCard
          title="Total Generations"
          value={analytics.totalGenerations}
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Growth Rate"
          value={dashboardOverview.growthRate}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Popular Content */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Star className="h-5 w-5" /> Most Popular Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardOverview.mostPopularPrompt ? (
              <div className="space-y-2">
                <div className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  {dashboardOverview.mostPopularPrompt.user?.name ?? 'Unknown'}
                </div>
                <div className="text-sm text-indigo-700 dark:text-indigo-300">
                  By: {dashboardOverview.mostPopularPrompt.user?.name ?? 'Unknown'}
                </div>
              </div>
            ) : (
              <div className="text-indigo-600 dark:text-indigo-400">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <Users className="h-5 w-5" /> Most Active User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardOverview.mostActiveUser ? (
              <div className="space-y-2">
                <div className="text-lg font-semibold text-cyan-900 dark:text-cyan-100">
                  {dashboardOverview.mostActiveUser.name ?? 'Unknown'}
                </div>
                <div className="text-sm text-cyan-700 dark:text-cyan-300">
                  {dashboardOverview.mostActiveUser.name ?? 'Unknown'}
                </div>
              </div>
            ) : (
              <div className="text-cyan-600 dark:text-cyan-400">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <RecentActivityCard activities={dashboardOverview.recentActivity.usages} />

      {/* Analytics Charts */}
      <AnalyticsCharts analytics={analytics} />
    </div>
  );
}
