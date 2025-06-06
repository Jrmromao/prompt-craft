import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import { NavBar } from '@/components/layout/NavBar';
import { currentUser } from '@clerk/nextjs/server';
import PromptCard from '@/components/prompts/PromptCard';
import Head from 'next/head';
import CommunityPromptsClient from './CommunityPromptsClient';

export const metadata: Metadata = {
  title: 'Community Prompts | PromptCraft',
  description:
    'Discover the best public prompts curated by the PromptCraft community. Browse, upvote, and get inspired by top AI prompts.',
};

async function getPublicPrompts() {
  return prisma.prompt.findMany({
    where: { isPublic: true },
    orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
    include: { tags: true },
    take: 50,
  });
}

function getItemListJsonLd(prompts: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Community Prompts',
    itemListElement: prompts.map((prompt, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `http://PromptCraft.co/community-prompts/${prompt.slug}`,
      name: prompt.name,
      description: prompt.description,
    })),
  };
}

export default async function CommunityPromptsPage() {
  const user = await currentUser();
  const prompts = await getPublicPrompts();

  const navUser = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : { name: 'Guest', email: '' };

  return <CommunityPromptsClient user={navUser} prompts={prompts} />;
}
