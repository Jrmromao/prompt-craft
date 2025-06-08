import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { PromptContent } from '@/components/PromptContent';
import { currentUser } from '@clerk/nextjs/server';

// Mark page as dynamic since it uses headers() through AnalyticsTrackingService
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<any>;
}

// Move to services/prompt.ts in a real app
async function getPrompt(slug: string) {
  try {
    return await prisma.prompt.findFirst({
      where: { slug, isPublic: true },
      include: { tags: true },
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

// Move to utils/seo.ts in a real app
function getPromptJsonLd(prompt: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: prompt.name,
    description: prompt.description,
    url: `http://PromptCraft.co/community-prompts/${prompt.slug}`,
    keywords: prompt.tags.map((tag: any) => tag.name).join(', '),
    datePublished: prompt.createdAt.toISOString(),
    dateModified: prompt.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'PromptCraft',
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const prompt = await getPrompt(resolvedParams.slug);
  if (!prompt) return { title: 'Prompt Not Found | PromptCraft' };

  const title = `${prompt.name} | Community Prompt | PromptCraft`;
  const description = prompt.description || 'Discover a top community prompt on PromptCraft.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `http://PromptCraft.co/community-prompts/${prompt.slug}`,
      images: [{ url: 'http://PromptCraft.co/og-image.jpg' }],
      publishedTime: prompt.createdAt.toISOString(),
      modifiedTime: prompt.updatedAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['http://PromptCraft.co/og-image.jpg'],
    },
    alternates: {
      canonical: `http://PromptCraft.co/community-prompts/${prompt.slug}`,
    },
  };
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-32 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function PromptDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const prompt = await getPrompt(resolvedParams.slug);
  if (!prompt) return notFound();

  const clerkUser = await currentUser();
  const user = clerkUser ? {
    name: clerkUser.fullName || '',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    imageUrl: clerkUser.imageUrl
  } : undefined;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PromptContent prompt={prompt} user={user} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPromptJsonLd(prompt)) }}
      />
    </Suspense>
  );
}
