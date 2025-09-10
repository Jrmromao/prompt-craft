'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Eye, Copy, ThumbsUp, TrendingUp, Users, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  views: {
    total: number
    trend: number
    daily: Array<{ date: string; count: number }>
  }
  copies: {
    total: number
    trend: number
    daily: Array<{ date: string; count: number }>
  }
  votes: {
    upvotes: number
    downvotes: number
    trend: number
    ratio: number
  }
  engagement: {
    comments: number
    shares: number
    favorites: number
  }
  demographics: {
    topCountries: Array<{ country: string; count: number }>
    userTypes: Array<{ type: string; count: number }>
  }
  performance: {
    rank: number
    category: string
    percentile: number
  }
}

interface PromptAnalyticsDashboardProps {
  promptId: string
  className?: string
}

export function PromptAnalyticsDashboard({ promptId, className }: PromptAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [promptId, timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/prompts/${promptId}/analytics?range=${timeRange}`)
      
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string
    value: number
    trend?: number
    icon: React.ComponentType<{ className?: string }>
    format?: 'number' | 'percentage'
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {format === 'percentage' ? `${value}%` : value.toLocaleString()}
            </p>
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
              )}>
                <TrendingUp className={cn("h-3 w-3", trend < 0 && "rotate-180")} />
                {Math.abs(trend)}% vs last period
              </div>
            )}
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const SimpleChart = ({ data, color = "purple" }: { 
    data: Array<{ date: string; count: number }>
    color?: string 
  }) => {
    const maxValue = Math.max(...data.map(d => d.count))
    
    return (
      <div className="flex items-end gap-1 h-20">
        {data.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-t transition-all duration-200 hover:opacity-80",
              color === "purple" && "bg-purple-500",
              color === "blue" && "bg-blue-500",
              color === "green" && "bg-green-500"
            )}
            style={{
              height: `${(item.count / maxValue) * 100}%`,
              minHeight: item.count > 0 ? '4px' : '2px'
            }}
            title={`${item.date}: ${item.count}`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Analytics data not available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  timeRange === range 
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    : "hover:bg-muted"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Views"
                value={analytics.views.total}
                trend={analytics.views.trend}
                icon={Eye}
              />
              <MetricCard
                title="Copies"
                value={analytics.copies.total}
                trend={analytics.copies.trend}
                icon={Copy}
              />
              <MetricCard
                title="Upvotes"
                value={analytics.votes.upvotes}
                trend={analytics.votes.trend}
                icon={ThumbsUp}
              />
              <MetricCard
                title="Success Rate"
                value={analytics.votes.ratio}
                icon={TrendingUp}
                format="percentage"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Views Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart data={analytics.views.daily} color="blue" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Copies Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart data={analytics.copies.daily} color="green" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Comments</span>
                    <span className="font-medium">{analytics.engagement.comments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Shares</span>
                    <span className="font-medium">{analytics.engagement.shares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Favorites</span>
                    <span className="font-medium">{analytics.engagement.favorites}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Countries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analytics.demographics.topCountries.map((country, index) => (
                    <div key={country.country} className="flex justify-between text-sm">
                      <span>{country.country}</span>
                      <span className="font-medium">{country.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">#{analytics.performance.rank}</div>
                  <div className="text-sm text-muted-foreground">Overall Rank</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.performance.percentile}%</div>
                  <div className="text-sm text-muted-foreground">Top Percentile</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Badge variant="secondary" className="text-sm">
                    {analytics.performance.category}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">Category</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
