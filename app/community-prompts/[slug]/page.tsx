import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import Link from 'next/link';
import { UpvoteButton } from '@/components/community/UpvoteButton';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Tag {
  id: string;
  name: string;
}

interface Prompt {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  upvotes: number;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<any>;
}

// Move to services/prompt.ts in a real app
async function getPrompt(slug: string): Promise<Prompt | null> {
  try {
    return await prisma.prompt.findUnique({
      where: { slug, isPublic: true, isApproved: true },
      include: { tags: true },
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

// Move to utils/seo.ts in a real app
function getPromptJsonLd(prompt: Prompt) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": prompt.name,
    "description": prompt.description,
    "url": `http://prompthive.co/community-prompts/${prompt.slug}`,
    "keywords": prompt.tags.map((tag) => tag.name).join(", "),
    "datePublished": prompt.createdAt.toISOString(),
    "dateModified": prompt.updatedAt.toISOString(),
    "author": {
      "@type": "Organization",
      "name": "PromptHive"
    }
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const prompt = await getPrompt(resolvedParams.slug);
  if (!prompt) return { title: 'Prompt Not Found | PromptHive' };

  const title = `${prompt.name} | Community Prompt | PromptHive`;
  const description = prompt.description || 'Discover a top community prompt on PromptHive.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `http://prompthive.co/community-prompts/${prompt.slug}`,
      images: [{ url: 'http://prompthive.co/og-image.jpg' }],
      publishedTime: prompt.createdAt.toISOString(),
      modifiedTime: prompt.updatedAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['http://prompthive.co/og-image.jpg'],
    },
    alternates: {
      canonical: `http://prompthive.co/community-prompts/${prompt.slug}`,
    },
  };
}

function PromptContent({ prompt }: { prompt: Prompt }) {
  return (
    <>
      <Link href="/community-prompts" className="text-purple-600 hover:underline mb-4 inline-block">
        ← Back to Community Prompts
      </Link>
      <h1 className="text-3xl font-bold mb-2">{prompt.name}</h1>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-purple-600 font-bold text-lg">⬆️ {prompt.upvotes}</span>
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>
      </div>
      <p className="text-gray-700 mb-6">{prompt.description}</p>
      <div className="bg-gray-50 border rounded p-4 font-mono whitespace-pre-wrap mb-6">
        {prompt.content}
      </div>
      <UpvoteButton promptId={prompt.id} upvotes={prompt.upvotes} />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-6 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default async function PromptDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const prompt = await getPrompt(resolvedParams.slug);
  if (!prompt) return notFound();

  return (
    <main className="container mx-auto py-8 px-4 max-w-2xl">
      <Suspense fallback={<LoadingSkeleton />}>
        <PromptContent prompt={prompt} />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPromptJsonLd(prompt)) }}
      />
    </main>
  );
} 