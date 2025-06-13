'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, MessageSquare, Sparkles, Users, Star, Clock, Edit, Trash2 } from 'lucide-react';
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
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
  user: {
    name: string | null;
    imageUrl: string | null;
  };
  _count: {
    votes: number;
  };
}

interface MyPromptsClientProps {
  prompts: Prompt[];
}

export function MyPromptsClient({ prompts }: MyPromptsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

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

  const recentPrompts = filteredPrompts.slice(0, 3);
  const otherPrompts = filteredPrompts.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent py-16">
        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/40 px-4 py-2 dark:border-purple-500/20 dark:bg-purple-500/10">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                My Prompts
              </span>
            </div>
            <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              Your Prompt Collection
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Manage and organize your prompts. Edit, share, and track their performance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/prompts/create">
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
                <Link href="/prompts/community">
                  <Users className="mr-2 h-4 w-4" />
                  Browse Community
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
              placeholder="Search your prompts..."
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
                onClick={() => setSortBy('recent')}
                className="focus:bg-purple-100/40 dark:focus:bg-purple-500/10"
              >
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('popular')}
                className="focus:bg-purple-100/40 dark:focus:bg-purple-500/10"
              >
                Most Popular
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Recent Prompts */}
        {recentPrompts.length > 0 && (
          <div className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold text-purple-700 dark:text-purple-300">
              <Clock className="mr-2 h-5 w-5" />
              Recently Updated
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPrompts.map(prompt => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <Card className="group relative h-full overflow-hidden border-purple-200 transition-all hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 dark:border-purple-500/20">
                    <CardHeader>
                      <div className="absolute -top-4 left-4">
                        <Badge className="rounded-full border border-white bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 font-semibold text-white shadow dark:border-gray-900">
                          Recent
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 line-clamp-1 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-500 dark:from-purple-300 dark:to-pink-300">
                        {prompt.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
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
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 ring-2 ring-purple-200 dark:ring-purple-500/20">
                            <AvatarImage src={prompt.user.imageUrl || undefined} alt={prompt.user.name || 'User'} />
                            <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                              {prompt.user.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{prompt.user.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-purple-400" />
                            <span>{prompt._count.votes} votes</span>
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

        {/* Other Prompts */}
        {otherPrompts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-300">All Prompts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherPrompts.map(prompt => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <Card className="group h-full border-purple-200 transition-all hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 dark:border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="line-clamp-1 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-500 dark:from-purple-300 dark:to-pink-300">
                        {prompt.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
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
                        {prompt.tags.map(tag => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="border-purple-200 bg-purple-100/40 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                            {prompt._count.votes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-purple-400" />
                            {prompt._count.votes} votes
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-purple-400 hover:bg-purple-100/40 hover:text-purple-600 dark:hover:bg-purple-500/10"
                            onClick={e => {
                              e.preventDefault();
                              // Handle edit
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:bg-red-100/40 hover:text-red-600 dark:hover:bg-red-500/10"
                            onClick={e => {
                              e.preventDefault();
                              // Handle delete
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-purple-200 p-8 text-center dark:border-purple-500/20">
            <h3 className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-300">No prompts found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filter to find what you're looking for."
                : "You haven't created any prompts yet. Start by creating your first prompt!"}
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/prompts/create">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Prompt
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 