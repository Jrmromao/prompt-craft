'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, ThumbsUp, MessageSquare, Play, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { usePromptAnalytics } from './PromptAnalyticsContext';

interface AnalyticsProps {
  promptId: string;
  upvotes?: number;
}

interface AnalyticsData {
  viewCount: number;
  usageCount: number;
  upvotes: number;
  copyCount: number;
  commentsCount: number;
  _count: {
    comments: number;
    votes: number;
  };
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
    result?: string;
    user: {
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  recentCopies: Array<{
    id: string;
    createdAt: string;
    user?: {
      name: string | null;
      imageUrl: string | null;
    };
  }>;
}

export function Analytics({ promptId, upvotes }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { copyCount, viewCount, usageCount, commentCount } = usePromptAnalytics();

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
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-gray-200" />
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upvotes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof upvotes === 'number' ? upvotes : analytics.upvotes}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.commentsCount || commentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Copies</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{copyCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
