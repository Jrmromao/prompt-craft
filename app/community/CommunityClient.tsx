import { EmptyState } from '@/components/ui/empty-state';
import { Search, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface Prompt {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  author: {
    name: string;
    image: string;
  };
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="mt-1 text-muted-foreground">
            Discover and learn from the community's prompts
          </p>
        </div>
        <Button asChild>
          <Link href="/prompts/new">
            <Sparkles className="mr-2 h-4 w-4" />
            Share Prompt
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
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
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Featured Prompts</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeaturedPrompts.map(prompt => (
              <Card key={prompt.id} className="p-6">
                <div className="flex h-full flex-col">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold">{prompt.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {prompt.description}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {prompt.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={prompt.author.image}
                        alt={prompt.author.name}
                        className="h-6 w-6 rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">{prompt.author.name}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/prompts/${prompt.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Prompts */}
      {recentPrompts?.length > 0 && (
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Recent Prompts</h2>
          <div className="space-y-6">
            {filteredRecentPrompts.map(prompt => (
              <Card key={prompt.id} className="p-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold">{prompt.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{prompt.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-between gap-4 md:items-end">
                    <div className="flex items-center gap-2">
                      <img
                        src={prompt.author.image}
                        alt={prompt.author.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="text-sm">
                        <div className="font-medium">{prompt.author.name}</div>
                        <div className="text-muted-foreground">
                          {new Date(prompt.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/prompts/${prompt.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </Card>
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
  );
}
