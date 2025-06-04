import { EmptyState } from "@/components/ui/empty-state";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrompts = prompts?.filter((prompt) =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!prompts?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={PlusCircle}
            title="No prompts yet"
            description="Create your first prompt to get started with PromptCraft."
            action={{
              label: "Create Prompt",
              onClick: () => window.location.href = "/prompts/new",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Prompts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your prompts
          </p>
        </div>
        <Button asChild>
          <Link href="/prompts/new">
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{prompt.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {prompt.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
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