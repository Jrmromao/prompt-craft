import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { PromptContent } from '@/components/PromptContent';
import { currentUser } from '@clerk/nextjs/server';
import { TestPromptModal } from '@/components/TestPromptModal';
import { PlanType } from '@/utils/constants';
import { UserService } from '@/lib/services/userService';

// Mark page as dynamic since it uses headers() through AnalyticsTrackingService
export const dynamic = 'force-dynamic';

async function getPrompt(id: string) {
  try {
    return await prisma.prompt.findFirst({
      where: { id },
      include: { 
        tags: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true }
        },
        user: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      },
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

async function getVersionHistory(promptId: string) {
  try {
    return await prisma.version.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching version history:', error);
    return [];
  }
}

async function getComments(promptId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, imageUrl: true } } },
      take: 10,
    });
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

async function getAnalytics(promptId: string) {
  try {
    // Example: fetch viewCount, usageCount, upvotes, copyCount, commentsCount
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: {
        viewCount: true,
        usageCount: true,
        upvotes: true,
        copyCount: true,
        comments: true,
      },
    });
    return {
      viewCount: prompt?.viewCount || 0,
      usageCount: prompt?.usageCount || 0,
      upvotes: prompt?.upvotes || 0,
      copyCount: prompt?.copyCount || 0,
      commentsCount: prompt?.comments?.length || 0,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { viewCount: 0, usageCount: 0, upvotes: 0, copyCount: 0, commentsCount: 0 };
  }
}

function getPromptJsonLd(prompt: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: prompt.name,
    description: prompt.description,
    datePublished: prompt.createdAt,
    dateModified: prompt.updatedAt,
    author: {
      '@type': 'Person',
      name: prompt.user?.name || 'Anonymous',
    },
  };
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const prompt = await getPrompt(params.id);
  if (!prompt) return { title: 'Prompt Not Found | PromptHive' };

  const title = `${prompt.name} | PromptHive`;
  const description = prompt.description || 'View this prompt on PromptHive.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `http://prompthive.co/prompts/${prompt.id}`,
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
      canonical: `http://prompthive.co/prompts/${prompt.id}`,
    },
  };
}

export default async function PromptDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const prompt = await getPrompt(params.id);
  if (!prompt) return notFound();

  const [versionHistory, comments, analytics] = await Promise.all([
    getVersionHistory(prompt.id),
    getComments(prompt.id),
    getAnalytics(prompt.id),
  ]);

  const promptWithVersion = {
    ...prompt,
    currentVersionId: prompt.versions[0]?.id || prompt.id,
    metadata: prompt.metadata as { copyCount?: number; viewCount?: number; usageCount?: number } | undefined,
  };

  const clerkUser = await currentUser();
  const userService = UserService.getInstance();
  const planType = clerkUser ? await userService.getPlanTypeFromClerk(clerkUser.id) : null;

  const userObj = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || '',
        username: clerkUser.username || 'anonymous',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
        planType: planType || PlanType.FREE,
      }
    : {
        id: 'anonymous',
        name: 'Anonymous',
        username: 'anonymous',
        email: '',
        imageUrl: '',
        planType: PlanType.FREE,
      };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptContent
        prompt={promptWithVersion}
        user={userObj}
        initialVersionHistory={versionHistory}
        initialComments={comments}
        initialAnalytics={analytics}
        initialCommentCount={comments.length}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPromptJsonLd(prompt)) }}
      />
    </Suspense>
  );
} 