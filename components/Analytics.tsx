"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Eye, ThumbsUp, MessageSquare, Play } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsProps {
  promptId: string;
}

interface AnalyticsData {
  views: number;
  uses: number;
  avgRating: number;
  recentViews: Array<{
    id: string;
    createdAt: string;
    user?: {
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  recentUsages: Array<{
    id: string;
    createdAt: string;
    success: boolean;
    user: {
      name: string | null;
      imageUrl: string | null;
    };
  }>;
}

export function Analytics({ promptId }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [promptId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upvotes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentViews.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="views" className="space-y-4">
        <TabsList>
          <TabsTrigger value="views">Recent Views</TabsTrigger>
          <TabsTrigger value="usages">Recent Uses</TabsTrigger>
        </TabsList>
        <TabsContent value="views" className="space-y-4">
          {analytics.recentViews.map((view) => (
            <div key={view.id} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={view.user?.imageUrl || undefined} />
                <AvatarFallback>
                  {view.user?.name?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {view.user?.name || 'Anonymous'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(view.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="usages" className="space-y-4">
          {analytics.recentUsages.map((usage) => (
            <div key={usage.id} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={usage.user.imageUrl || undefined} />
                <AvatarFallback>
                  {usage.user.name?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{usage.user.name || 'Anonymous'}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(usage.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {usage.success ? 'Success' : 'Failed'}
                </p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 