'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';

interface Prompt {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  author: {
    name: string;
    image: string;
  };
  upvotes: number;
  comments: number;
}

interface CommunityClientProps {
  featuredPrompts: Prompt[];
  recentPrompts: Prompt[];
}

export function CommunityClient({ featuredPrompts, recentPrompts }: CommunityClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeaturedPrompts = featuredPrompts?.filter(
    prompt =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRecentPrompts = recentPrompts?.filter(
    prompt =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasNoPrompts = !featuredPrompts?.length && !recentPrompts?.length;
  const hasNoSearchResults =
    searchQuery && !filteredFeaturedPrompts?.length && !filteredRecentPrompts?.length;

  if (hasNoPrompts) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <EmptyState
              icon={Sparkles}
              title="No public prompts yet"
              description="Be the first to share your prompts with the community."
              action={{
                label: 'Create Prompt',
                onClick: () => (window.location.href = '/prompts/new'),
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/5 py-16">
        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Community</h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Discover and learn from the community's prompts. Get inspired, learn, and contribute to
              the future of AI prompting.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/prompts/new">
                  <Sparkles className="mr-2 h-4 w-4" />
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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search community prompts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Featured Prompts */}
        {featuredPrompts?.length > 0 && (
          <div className="space-y-4">
            <h2 className="flex items-center text-2xl font-semibold">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Featured Prompts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeaturedPrompts.map(prompt => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="line-clamp-1">{prompt.title}</CardTitle>
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
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prompt.author.image} />
                            <AvatarFallback>
                              {prompt.author.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{prompt.author.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {prompt.upvotes}
                          </span>
                          <span>{prompt.comments} comments</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Prompts */}
        {recentPrompts?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Recent Prompts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecentPrompts.map(prompt => (
                <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                  <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{prompt.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {prompt.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prompt.author.image} />
                            <AvatarFallback>
                              {prompt.author.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{prompt.author.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {prompt.upvotes}
                          </span>
                          <span>{prompt.comments} comments</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty Search Results */}
        {hasNoSearchResults && (
          <div className="flex flex-col items-center justify-center py-12">
            <EmptyState
              icon={Search}
              title="No matching prompts"
              description="Try adjusting your search query to find what you're looking for."
            />
          </div>
        )}
      </div>
    </div>
  );
}
