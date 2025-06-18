import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { PromptContent } from '@/components/PromptContent';
import { currentUser } from '@clerk/nextjs/server';
import { PlanType } from '@/utils/constants';

// Mark page as dynamic since it uses headers() through AnalyticsTrackingService
export const dynamic = 'force-dynamic';

// Fetch prompt by slug
async function getPrompt(slug: string) {
  try {
    return await prisma.prompt.findFirst({
      where: { slug, isPublic: true },
      include: { 
        tags: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true }
        }
      },
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

// JSON-LD for SEO
function getPromptJsonLd(prompt: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: prompt.name,
    description: prompt.description,
    url: `http://PromptHive.co/community-prompts/${prompt.slug}`,
    keywords: prompt.tags.map((tag: any) => tag.name).join(', '),
    datePublished: prompt.createdAt.toISOString(),
    dateModified: prompt.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'PromptHive',
    },
  };
}

// Dynamic metadata
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const prompt = await getPrompt(params.slug);
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
      url: `http://PromptHive.co/community-prompts/${prompt.slug}`,
      images: [{ url: 'http://PromptHive.co/og-image.jpg' }],
      publishedTime: prompt.createdAt.toISOString(),
      modifiedTime: prompt.updatedAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['http://PromptHive.co/og-image.jpg'],
    },
    alternates: {
      canonical: `http://PromptHive.co/community-prompts/${prompt.slug}`,
    },
  };
}

// Loading skeleton
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

// Main page
export default async function PromptDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const prompt = await getPrompt(params.slug);
  if (!prompt) return notFound();

  // Fetch initial comment count
  const initialCommentCount = await prisma.comment.count({ where: { promptId: prompt.id } });

  const promptWithVersion = {
    ...prompt,
    currentVersionId: prompt.versions[0]?.id || prompt.id,
    metadata: prompt.metadata as { copyCount?: number; viewCount?: number; usageCount?: number } | undefined,
    promptType: prompt.promptType || 'text',
  };

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return notFound();
  }

  // Fetch user info directly from the database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      planType: true,
    },
  });

  // Prepare minimal user object for PromptContent
  const minimalUser = {
    id: dbUser?.id || 'anonymous',
    name: dbUser?.name || 'Anonymous',
    username: dbUser?.username || 'anonymous',
    email: dbUser?.email || '',
    planType: PlanType[dbUser?.planType as keyof typeof PlanType] || PlanType.FREE,
  };

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PromptContent prompt={promptWithVersion} user={minimalUser} initialCommentCount={initialCommentCount} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPromptJsonLd(prompt)) }}
      />
    </Suspense>
  );
}