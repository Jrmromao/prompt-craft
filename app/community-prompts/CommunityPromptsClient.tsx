'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, TrendingUp, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Prompt {
  id: string;
  name: string;
  content: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
  user: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  _count: {
    votes: number;
    comments: number;
  };
}

interface CommunityPromptsClientProps {
  prompts: Prompt[];
}

export default function CommunityPromptsClient({ prompts }: CommunityPromptsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('popular');

  const filteredPrompts = prompts
    .filter(prompt => {
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
      return b._count.votes - a._count.votes;
    });

  const featuredPrompts = filteredPrompts.slice(0, 3);
  const regularPrompts = filteredPrompts.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/5 py-16">
        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Community Prompts
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Discover and share the best prompts with our growing community. Get inspired, learn, and
              contribute to the future of AI prompting.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/prompts/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Share Your Prompt
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/prompts/my-prompts">
                  <Users className="mr-2 h-4 w-4" />
                  My Prompts
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      </div>

      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Featured Prompts */}
        {featuredPrompts.length > 0 && (
          <div className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Featured Prompts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPrompts.map(prompt => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="line-clamp-1">{prompt.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {prompt.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Featured
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {prompt.tags.map(tag => (
                          <Badge key={tag.id} variant="outline">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prompt.user.imageUrl || undefined} />
                            <AvatarFallback>
                              {prompt.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{prompt.user.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {prompt._count.votes}
                          </span>
                          <span>{prompt._count.comments} comments</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Sort by: {sortBy === 'recent' ? 'Most Recent' : 'Most Popular'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('popular')}>Most Popular</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('recent')}>Most Recent</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Regular Prompts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularPrompts.map(prompt => (
            <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
              <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{prompt.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map(tag => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={prompt.user.imageUrl || undefined} />
                        <AvatarFallback>
                          {prompt.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{prompt.user.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {prompt._count.votes}
                      </span>
                      <span>{prompt._count.comments} comments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">No prompts found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filter to find what you're looking for."
                : 'Be the first to share a prompt with the community!'}
            </p>
            <Button asChild>
              <Link href="/prompts/create">
                <Plus className="mr-2 h-4 w-4" />
                Share Your Prompt
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 