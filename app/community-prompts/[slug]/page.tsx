import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import Link from 'next/link';
import Head from 'next/head';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const prompt = await prisma.prompt.findUnique({
    where: { slug: params.slug, isPublic: true, isApproved: true },
  });
  if (!prompt) return { title: 'Prompt Not Found | PromptHive' };
  return {
    title: `${prompt.name} | Community Prompt | PromptHive`,
    description: prompt.description || 'Discover a top community prompt on PromptHive.'
  };
}

async function getPrompt(slug: string) {
  return prisma.prompt.findUnique({
    where: { slug, isPublic: true, isApproved: true },
    include: { tags: true },
  });
}

function getPromptJsonLd(prompt: any) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": prompt.name,
    "description": prompt.description,
    "url": `http://prompthive.co/community-prompts/${prompt.slug}`,
    "keywords": prompt.tags.map((tag: any) => tag.name).join(", ")
  };
}

export default async function PromptDetailPage({ params }: { params: { slug: string } }) {
  const prompt = await getPrompt(params.slug);
  if (!prompt) return notFound();

  return (
    <>
      <Head>
        <title>{prompt.name} | Community Prompt | PromptHive</title>
        <meta name="description" content={prompt.description || 'Discover a top community prompt on PromptHive.'} />
        <link rel="canonical" href={`http://prompthive.co/community-prompts/${prompt.slug}`} />
        {/* Open Graph */}
        <meta property="og:title" content={`${prompt.name} | Community Prompt | PromptHive`} />
        <meta property="og:description" content={prompt.description || 'Discover a top community prompt on PromptHive.'} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`http://prompthive.co/community-prompts/${prompt.slug}`} />
        <meta property="og:image" content="http://prompthive.co/og-image.jpg" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${prompt.name} | Community Prompt | PromptHive`} />
        <meta name="twitter:description" content={prompt.description || 'Discover a top community prompt on PromptHive.'} />
        <meta name="twitter:image" content="http://prompthive.co/og-image.jpg" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getPromptJsonLd(prompt)) }}
        />
      </Head>
      <main className="container mx-auto py-8 px-4 max-w-2xl">
        <Link href="/community-prompts" className="text-purple-600 hover:underline mb-4 inline-block">← Back to Community Prompts</Link>
        <h1 className="text-3xl font-bold mb-2">{prompt.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-purple-600 font-bold text-lg">⬆️ {prompt.upvotes}</span>
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag: any) => (
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
    </>
  );
}

import { UpvoteButton } from '@/components/community/UpvoteButton'; 