import { EmptyState } from '@/components/ui/empty-state';
import { PlusCircle, Search } from 'lucide-react';
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
}

interface PromptsClientProps {
  prompts: Prompt[];
}

export function PromptsClient({ prompts }: PromptsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrompts = prompts?.filter(
    prompt =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!prompts?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <EmptyState
            icon={PlusCircle}
            title="No prompts yet"
            description="Create your first prompt to get started with PromptHive."
            action={
              <Button onClick={() => (window.location.href = '/prompts/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Prompt
              </Button>
            }
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
          <h1 className="text-3xl font-bold">My Prompts</h1>
          <p className="mt-1 text-muted-foreground">Manage and organize your prompts</p>
        </div>
        <Button asChild>
          <Link href="/prompts/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Prompt
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map(prompt => (
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
                <div className="text-sm text-muted-foreground">
                  {new Date(prompt.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/prompts/${prompt.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/prompts/${prompt.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty Search Results */}
      {filteredPrompts.length === 0 && searchQuery && (
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
