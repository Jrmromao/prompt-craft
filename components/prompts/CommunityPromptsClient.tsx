'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, TrendingUp, Users, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInView } from 'react-intersection-observer';
import { PromptService } from '@/lib/services/promptService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Prompt {
  id: string;
  name: string;
  description: string | null;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  lastViewedAt: string | null;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  upvotes: number;
  _count: {
    votes: number;
  };
  tags: { id: string; name: string }[];
}

interface CommunityPromptsClientProps {
  initialPrompts: Prompt[];
  totalPrompts: number;
}

export function CommunityPromptsClient({ initialPrompts, totalPrompts }: CommunityPromptsClientProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState((initialPrompts?.length || 0) < (totalPrompts || 0));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('popular');
  const { ref, inView } = useInView();

  const loadMorePrompts = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/prompts/public?page=${page + 1}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.prompts || !Array.isArray(data.prompts)) {
        throw new Error('Invalid response format');
      }

      setPrompts((prev) => [...prev, ...data.prompts]);
      setPage((prev) => prev + 1);
      setHasMore(data.prompts.length === 10);
    } catch (err) {
      console.error('Error loading more prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView) {
      loadMorePrompts();
    }
  }, [inView]);

  const filteredPrompts = prompts
    .filter(prompt => {
      if (!prompt) return false;
      const searchLower = searchQuery.toLowerCase();
      return (
        prompt.name.toLowerCase().includes(searchLower) ||
        (prompt.description?.toLowerCase() || '').includes(searchLower) ||
        prompt.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return b.upvotes - a.upvotes;
    });

  const featuredPrompts = filteredPrompts.slice(0, 3);
  const regularPrompts = filteredPrompts.slice(3);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent py-16">
        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/40 px-4 py-2 dark:border-purple-500/20 dark:bg-purple-500/10">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Community Prompts
              </span>
            </div>
            <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              Discover Amazing Prompts
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Explore, upvote, and get inspired by the best prompts from our community.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/prompts/new">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create New Prompt
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-purple-200 hover:bg-purple-100/40 dark:border-purple-500/20 dark:hover:bg-purple-500/10"
              >
                <Link href="/prompts/my-prompts">
                  <Users className="mr-2 h-4 w-4" />
                  My Prompts
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-pink-500/5 to-transparent" />
      </div>

      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border-purple-200 pl-9 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-500/20"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-purple-200 hover:bg-purple-100/40 dark:border-purple-500/20 dark:hover:bg-purple-500/10 md:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                Sort by: {sortBy === 'recent' ? 'Most Recent' : 'Most Popular'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-purple-200 dark:border-purple-500/20">
              <DropdownMenuItem
                onClick={() => setSortBy('popular')}
                className="focus:bg-purple-100/40 dark:focus:bg-purple-500/10"
              >
                Most Popular
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('recent')}
                className="focus:bg-purple-100/40 dark:focus:bg-purple-500/10"
              >
                Most Recent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Featured Prompts */}
        {featuredPrompts.length > 0 && (
          <div className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-purple-700 dark:text-purple-300">
              <Sparkles className="mr-2 h-5 w-5" />
              Featured Prompts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPrompts.map((prompt, index) => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <Card className="group relative h-full overflow-hidden border-purple-200 transition-all hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 dark:border-purple-500/20">
                    <div className="absolute -top-4 left-4">
                      <Badge className="rounded-full border border-white bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 font-semibold text-white shadow dark:border-gray-900">
                        Featured
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="line-clamp-1 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-500 dark:from-purple-300 dark:to-pink-300">
                            {prompt.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{prompt.description || 'No description provided'}</CardDescription>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Avatar className="h-6 w-6 ring-2 ring-purple-200 dark:ring-purple-500/20">
                          <AvatarImage src={prompt.user.imageUrl || undefined} alt={prompt.user.name || 'User'} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                            {prompt.user.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{prompt.user.name || 'Anonymous'}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {prompt.tags.slice(0, 2).map(tag => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="border-purple-200 bg-purple-100/40 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {prompt.tags.length > 2 && (
                          <Badge
                            variant="outline"
                            className="border-purple-200 bg-purple-100/40 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                          >
                            +{prompt.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-purple-400" />
                            {prompt.upvotes}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Prompts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularPrompts.map((prompt, index) => (
            <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
              <Card className="group h-full border-purple-200 transition-all hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 dark:border-purple-500/20">
                <CardHeader>
                  <CardTitle className="line-clamp-1 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-500 dark:from-purple-300 dark:to-pink-300">
                    {prompt.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{prompt.description || 'No description provided'}</CardDescription>
                  <div className="mt-4 flex items-center gap-2">
                    <Avatar className="h-6 w-6 ring-2 ring-purple-200 dark:ring-purple-500/20">
                      <AvatarImage src={prompt.user.imageUrl || undefined} alt={prompt.user.name || 'User'} />
                      <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                        {prompt.user.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{prompt.user.name || 'Anonymous'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.slice(0, 2).map(tag => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="border-purple-200 bg-purple-100/40 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {prompt.tags.length > 2 && (
                      <Badge
                        variant="outline"
                        className="border-purple-200 bg-purple-100/40 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                      >
                        +{prompt.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        {prompt.upvotes}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-purple-200 p-8 text-center dark:border-purple-500/20">
            <h3 className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-300">No prompts found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filter to find what you're looking for."
                : 'Be the first to share a prompt with the community!'}
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/prompts/new">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Prompt
              </Link>
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        )}

        {/* Load More Trigger */}
        {hasMore && !loading && (
          <div ref={ref} className="h-20" />
        )}
      </div>
    </div>
  );
} 