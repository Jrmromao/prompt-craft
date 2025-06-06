'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import PromptCard from '@/components/prompts/PromptCard';

interface CommunityPromptsClientProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  };
  prompts: Array<{
    id: string;
    name: string;
    description: string | null;
    content: string;
    upvotes: number;
    tags: Array<{
      id: string;
      name: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function CommunityPromptsClient({ user, prompts }: CommunityPromptsClientProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <main className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Community Prompts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} isFeatured={false} />
          ))}
        </div>
      </main>
    </div>
  );
} 