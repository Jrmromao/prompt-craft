import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsService } from "@/lib/services/analyticsService";
import AnalyticsCharts from "./components/AnalyticsCharts";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  BarChart2, 
  Clock,
  Star,
  Copy
} from "lucide-react";

async function getAnalytics() {
  try {
    const analyticsService = AnalyticsService.getInstance();
    const data = await analyticsService.getAnalytics();
    
    // Calculate growth rate
    const growthRate = data.dashboardOverview.totalPromptViews > 0 
      ? ((data.dashboardOverview.totalPromptCopies / data.dashboardOverview.totalPromptViews) * 100).toFixed(1)
      : 0;

    return {
      totalUsers: data.totalUsers,
      totalPrompts: data.totalPrompts,
      totalUsage: data.totalUsage,
      userGrowth: [], // This will be populated from a separate endpoint if needed
      promptUsage: [], // This will be populated from a separate endpoint if needed
      planDistribution: [], // This will be populated from a separate endpoint if needed
      dashboardOverview: {
        ...data.dashboardOverview,
        growthRate: `${growthRate}%`,
        recentActivity: {
          usages: data.dashboardOverview.recentActivity.usages || [],
          views: [], // This will be populated from a separate endpoint if needed
          copies: [] // This will be populated from a separate endpoint if needed
        }
      }
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalUsers: 0,
      totalPrompts: 0,
      totalUsage: 0,
      userGrowth: [],
      promptUsage: [],
      planDistribution: [],
      dashboardOverview: {
        totalPromptViews: 0,
        totalPromptCopies: 0,
        mostPopularPrompt: null,
        mostActiveUser: null,
        growthRate: '0%',
        recentActivity: {
          usages: [],
          views: [],
          copies: []
        }
      }
    };
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();
  const { dashboardOverview } = analytics;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics Overview</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track platform growth and usage metrics
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <BarChart2 className="w-4 h-4 mr-2" />
          Live Analytics
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Users className="w-5 h-5" /> Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {analytics.totalUsers?.toLocaleString?.() ?? analytics.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
              <FileText className="w-5 h-5" /> Total Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {analytics.totalPrompts?.toLocaleString?.() ?? analytics.totalPrompts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Activity className="w-5 h-5" /> Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {analytics.totalUsage?.toLocaleString?.() ?? analytics.totalUsage}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <TrendingUp className="w-5 h-5" /> Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {dashboardOverview.growthRate}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Content */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Star className="w-5 h-5" /> Most Popular Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardOverview.mostPopularPrompt ? (
              <div className="space-y-2">
                <div className="font-semibold text-lg text-indigo-900 dark:text-indigo-100">
                  {dashboardOverview.mostPopularPrompt.name}
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

        <Card className="border-cyan-200 bg-cyan-50 dark:bg-cyan-950 dark:border-cyan-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <Users className="w-5 h-5" /> Most Active User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardOverview.mostActiveUser ? (
              <div className="space-y-2">
                <div className="font-semibold text-lg text-cyan-900 dark:text-cyan-100">
                  {dashboardOverview.mostActiveUser.name ?? 'Unknown'}
                </div>
                <div className="text-sm text-cyan-700 dark:text-cyan-300">
                  {dashboardOverview.mostActiveUser.email}
                </div>
              </div>
            ) : (
              <div className="text-cyan-600 dark:text-cyan-400">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Prompt Usages</h3>
              <ul className="space-y-2">
                {dashboardOverview.recentActivity.usages.map((u: any) => (
                  <li key={u.id} className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{u.user?.name ?? 'Unknown'}</span> used{' '}
                    <span className="font-medium">{u.prompt?.name ?? 'Prompt'}</span>
                    <div className="text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <AnalyticsCharts analytics={analytics} />
    </div>
  );
} 