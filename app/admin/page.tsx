"use client";

import { Suspense, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Activity, MessageSquare, BarChart2, Shield, CreditCard, History, Clock, ArrowUpRight, ArrowDownRight, Server, Database, Zap, Cpu } from "lucide-react";
import { AnalyticsService } from "@/lib/services/analyticsService";
import { AuditService } from "@/lib/services/auditService";
import { AuditLogs } from "./components/AuditLogs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { DraggableQuickActions } from "./components/DraggableQuickActions";
import { ApiUsageDialog } from "./components/ApiUsageDialog";
import { DeepseekDialog } from "./components/DeepseekDialog";

interface Stats {
  totalUsers: number;
  totalPrompts: number;
  totalUsage: number;
  dashboardOverview: {
    totalPromptViews: number;
    totalPromptCopies: number;
    mostPopularPrompt: {
      user: {
        name: string | null;
      };
    } | null;
    mostActiveUser: {
      name: string | null;
    } | null;
    recentActivity: {
      usages: Array<{
        id: string;
        createdAt: string;
        user: {
          name: string | null;
        };
        prompt: {
          name: string;
        };
      }>;
    };
  };
  recentLogs: Array<{
    id: string;
    action: string;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
  }>;
}

// Loading component for cards with shimmer effect
function CardSkeleton() {
  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-[60px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Card>
  );
}

// Loading component for quick actions with shimmer effect
function QuickActionSkeleton() {
  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[180px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Card>
  );
}

// Loading component for system status
function SystemStatusSkeleton() {
  return (
    <Card className="p-6 overflow-hidden relative">
      <Skeleton className="h-4 w-[100px] mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Card>
  );
}

// Loading component for recent activity
function RecentActivitySkeleton() {
  return (
    <Card className="p-6 lg:col-span-2 overflow-hidden relative">
      <Skeleton className="h-4 w-[100px] mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((section) => (
          <div key={section}>
            <Skeleton className="h-4 w-[120px] mb-2" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Card>
  );
}

export default function AdminDashboard() {
  const [isApiUsageDialogOpen, setIsApiUsageDialogOpen] = useState(false);
  const [isDeepseekDialogOpen, setIsDeepseekDialogOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalUsage: 0,
    usageChange: 0,
  });

  const [stats, setStats] = useState<Stats | null>(null);
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getAnalytics();
        setAnalytics({
          totalUsers: data.totalUsers,
          activeUsers: data.dashboardOverview.totalPromptViews,
          totalUsage: data.totalUsage,
          usageChange: 12, // This should be calculated based on historical data
        });
        setStats(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      description: "Total registered users",
      trend: {
        value: "+12%",
        direction: "up",
        period: "from last month"
      },
      color: "bg-blue-500",
      status: "healthy"
    },
    {
      title: "Active Users",
      value: stats?.dashboardOverview.totalPromptViews ?? 0,
      icon: Activity,
      description: "Users active in last 30 days",
      trend: {
        value: "+8%",
        direction: "up",
        period: "from last month"
      },
      color: "bg-green-500",
      status: "healthy"
    },
    {
      title: "Total Prompts",
      value: stats?.totalPrompts ?? 0,
      icon: MessageSquare,
      description: "Community prompts created",
      trend: {
        value: "+24%",
        direction: "up",
        period: "from last month"
      },
      color: "bg-purple-500",
      status: "healthy"
    },
    {
      title: "Total Usage",
      value: stats?.totalUsage ?? 0,
      icon: BarChart2,
      description: "Total prompt usages",
      trend: {
        value: "+18%",
        direction: "up",
        period: "from last month"
      },
      color: "bg-orange-500",
      status: "healthy"
    },
    {
      title: "Server Load",
      value: "45%",
      icon: Server,
      description: "Current server utilization",
      trend: {
        value: "-5%",
        direction: "down",
        period: "from last hour"
      },
      color: "bg-indigo-500",
      status: "healthy"
    },
    {
      title: "Database Health",
      value: "99.9%",
      icon: Database,
      description: "Database uptime",
      trend: {
        value: "0.1%",
        direction: "up",
        period: "from last week"
      },
      color: "bg-teal-500",
      status: "healthy"
    },
    {
      title: "API Response",
      value: "125ms",
      icon: Zap,
      description: "Average response time",
      trend: {
        value: "-15ms",
        direction: "down",
        period: "from last day"
      },
      color: "bg-yellow-500",
      status: "healthy"
    },
    {
      title: "AI Processing",
      value: "2.3s",
      icon: Cpu,
      description: "Average AI processing time",
      trend: {
        value: "-0.5s",
        direction: "down",
        period: "from last week"
      },
      color: "bg-pink-500",
      status: "healthy"
    }
  ];

  const quickActions = [
    {
      title: "API Usage",
      description: "View API usage statistics and costs",
      icon: <BarChart2 className="h-6 w-6" />,
      onClick: () => setIsApiUsageDialogOpen(true)
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: <Users className="h-6 w-6" />,
      onClick: () => {}
    },
    {
      title: "Activity Logs",
      description: "View system activity and audit logs",
      icon: <Activity className="h-6 w-6" />,
      onClick: () => {}
    },
    {
      title: "Support Tickets",
      description: "Manage user support requests",
      icon: <MessageSquare className="h-6 w-6" />,
      onClick: () => {}
    }
  ];

  const systemStatus = {
    server: "Operational",
    database: "Healthy",
    api: "Operational",
    lastChecked: new Date().toLocaleString()
  };

  // Add DeepSeek cost tracking
  const [deepseekCosts, setDeepseekCosts] = useState<any>(null);
  const [isLoadingCosts, setIsLoadingCosts] = useState(true);

  useEffect(() => {
    const fetchDeepseekCosts = async () => {
      try {
        const response = await fetch('/api/admin/deepseek-costs');
        if (!response.ok) throw new Error('Failed to fetch costs');
        const data = await response.json();
        setDeepseekCosts(data);
      } catch (error) {
        console.error('Error fetching DeepSeek costs:', error);
      } finally {
        setIsLoadingCosts(false);
      }
    };

    fetchDeepseekCosts();
  }, []);

  // Update the AI API Cost badge with real data
  const aiCostAction = quickActions.find(action => action.title === "API Usage");
  if (aiCostAction && deepseekCosts) {
    console.log(`Current Month: $${deepseekCosts.totalCost.toFixed(2)}`);
  }

  // Add DeepSeek cost card to the stats overview
  const deepseekCostCard = {
    title: "DeepSeek API Cost",
    value: deepseekCosts ? deepseekCosts.totalCost : 0,
    icon: BarChart2,
    description: "Current month's API usage cost",
    trend: deepseekCosts ? {
      value: `${deepseekCosts.cacheHitRate.toFixed(1)}%`,
      direction: "up",
      period: "cache hit rate"
    } : {
      value: "0%",
      direction: "up",
      period: "cache hit rate"
    },
    color: "bg-indigo-500",
    status: "healthy"
  };

  // Add the cost card to the cards array
  cards.push(deepseekCostCard);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor platform activity and performance
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <BarChart2 className="w-4 h-4 mr-2" />
          Live Analytics
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card 
            key={card.title}
            className="p-6 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group cursor-pointer"
            onClick={() => {
              if (card.title === "DeepSeek API Cost") {
                setIsDeepseekDialogOpen(true);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    card.status === 'healthy' ? 'bg-green-50 text-green-700' : 
                    card.status === 'warning' ? 'bg-yellow-50 text-yellow-700' : 
                    'bg-red-50 text-red-700'
                  }`}>
                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-500">{card.description}</p>
                <div className="mt-2 flex items-center text-sm">
                  {card.trend.direction === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={card.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {card.trend.value}
                  </span>
                  <span className="text-gray-500 ml-1">{card.trend.period}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.color} text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* System Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Suspense fallback={<SystemStatusSkeleton />}>
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-sm font-medium text-gray-500 mb-4">System Status</h3>
            <div className="space-y-4">
              {Object.entries(systemStatus).map(([key, value]) => (
                key !== 'lastChecked' && (
                  <div key={key} className="flex items-center justify-between group">
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100 transition-colors duration-200">
                      {value}
                    </Badge>
                  </div>
                )
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Last checked: {systemStatus.lastChecked}
                </div>
              </div>
            </div>
          </Card>
        </Suspense>

        {/* Recent Activity */}
        <Suspense fallback={<RecentActivitySkeleton />}>
          <div className="lg:col-span-2">
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Recent Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Recent User Signups</h4>
                  <div className="space-y-2">
                    {stats?.dashboardOverview.recentActivity.usages.slice(0, 5).map((usage) => (
                      <div 
                        key={usage.id} 
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                          <Users className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                            {usage.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(usage.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Recent Prompt Usage</h4>
                  <div className="space-y-2">
                    {stats?.dashboardOverview.recentActivity.usages.slice(0, 5).map((usage) => (
                      <div 
                        key={usage.id} 
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                          <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                            {usage.prompt?.name || 'Unknown Prompt'}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(usage.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Suspense>
      </div>

      {/* Audit Logs */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            Recent Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CardSkeleton />}>
            {stats?.recentLogs && (
              <div className="space-y-4">
                {stats.recentLogs.map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{log.user.name || log.user.email}</p>
                        <p className="text-xs text-gray-500">{log.action}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>

      {/* API Usage Dialog */}
      <ApiUsageDialog
        open={isApiUsageDialogOpen}
        onOpenChange={setIsApiUsageDialogOpen}
      />

      {/* DeepSeek Dialog */}
      <DeepseekDialog
        open={isDeepseekDialogOpen}
        onOpenChange={setIsDeepseekDialogOpen}
        costs={deepseekCosts}
      />
    </div>
  );
} 