import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { promptId: string } }): Promise<Metadata> {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.promptId, isPublic: true, isApproved: true },
  });
  if (!prompt) return { title: 'Prompt Not Found | PromptCraft' };
  return {
    title: `${prompt.name} | Community Prompt | PromptCraft`,
    description: prompt.description || 'Discover a top community prompt on PromptCraft.'
  };
}

async function getPrompt(promptId: string) {
  return prisma.prompt.findUnique({
    where: { id: promptId, isPublic: true, isApproved: true },
    include: { tags: true },
  });
}

export default async function PromptDetailPage({ params }: { params: { promptId: string } }) {
  const prompt = await getPrompt(params.promptId);
  if (!prompt) return notFound();

  return (
    <main className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href="/community-prompts" className="text-purple-600 hover:underline mb-4 inline-block">← Back to Community Prompts</Link>
      <h1 className="text-3xl font-bold mb-2">{prompt.name}</h1>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-purple-600 font-bold text-lg">⬆️ {prompt.upvotes}</span>
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map(tag => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>
      </div>
      <p className="text-gray-700 mb-6">{prompt.description}</p>
      <div className="bg-gray-50 border rounded p-4 font-mono whitespace-pre-wrap mb-6">
        {prompt.content}
      </div>
      {/* Upvote button (client component) */}
      <UpvoteButton promptId={prompt.id} upvotes={prompt.upvotes} />
    </main>
  );
}

import { UpvoteButton } from '@/components/community/UpvoteButton'; 