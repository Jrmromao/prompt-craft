import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import { NavBar } from '@/components/layout/NavBar';
import { currentUser } from '@clerk/nextjs/server';
import PromptCard from '@/components/prompts/PromptCard';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Community Prompts | PromptCraft',
  description: 'Discover the best public prompts curated by the PromptCraft community. Browse, upvote, and get inspired by top AI prompts.',
};

async function getPublicPrompts() {
  return prisma.prompt.findMany({
    where: { isPublic: true, isApproved: true },
    orderBy: [
      { upvotes: 'desc' },
      { createdAt: 'desc' },
    ],
    include: { tags: true },
    take: 50,
  });
}

function getItemListJsonLd(prompts: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Community Prompts",
    "itemListElement": prompts.map((prompt, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `http://PromptCraft.co/community-prompts/${prompt.slug}`,
      "name": prompt.name,
      "description": prompt.description
    }))
  };
}

export default async function CommunityPromptsPage() {
  const prompts = await getPublicPrompts();
  const user = await currentUser();
  const navUser = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : { name: 'Guest', email: '' };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col">
      <Head>
        <title>Community Prompts | PromptCraft</title>
        <meta name="description" content="Discover the best public prompts curated by the PromptCraft community. Browse, upvote, and get inspired by top AI prompts." />
        <link rel="canonical" href="http://PromptCraft.co/community-prompts" />
        {/* Open Graph */}
        <meta property="og:title" content="Community Prompts | PromptCraft" />
        <meta property="og:description" content="Discover the best public prompts curated by the PromptCraft community. Browse, upvote, and get inspired by top AI prompts." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="http://PromptCraft.co/community-prompts" />
        <meta property="og:image" content="http://PromptCraft.co/og-image.jpg" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Community Prompts | PromptCraft" />
        <meta name="twitter:description" content="Discover the best public prompts curated by the PromptCraft community. Browse, upvote, and get inspired by top AI prompts." />
        <meta name="twitter:image" content="http://PromptCraft.co/og-image.jpg" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getItemListJsonLd(prompts)) }}
        />
      </Head>
      <NavBar user={navUser} />
      <main className="flex-1 max-w-7xl mx-auto px-4 pb-16">
        {/* Hero Section */}
        <section className="pt-16 pb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-pink-300">
            Community Prompts
          </h1>
          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the best public prompts curated by our community. Upvote your favorites and get inspired!
          </p>
        </section>
        {/* Prompts Grid */}
        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="text-4xl mb-4">😕</span>
            <p className="text-lg text-gray-500 dark:text-gray-400">No community prompts found. Be the first to contribute!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt, idx) => (
              <PromptCard key={prompt.id} prompt={prompt} isFeatured={idx < 3} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 