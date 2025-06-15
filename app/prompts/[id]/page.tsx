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

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const prompt = await getPrompt(resolvedParams.id);
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

export default async function PromptDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const prompt = await getPrompt(resolvedParams.id);
  if (!prompt) return notFound();

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
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
        planType: planType || PlanType.FREE,
      }
    : {
        id: 'anonymous',
        name: 'Anonymous',
        email: '',
        imageUrl: '',
        planType: PlanType.FREE,
      };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptContent prompt={promptWithVersion} user={userObj} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPromptJsonLd(prompt)) }}
      />x
    </Suspense>
  );
} 