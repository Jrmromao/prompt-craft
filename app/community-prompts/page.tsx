import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { CommunityPromptsClient } from '@/components/prompts/CommunityPromptsClient';

export const metadata: Metadata = {
  title: 'Community Prompts | PromptCraft',
  description:
    'Discover the best public prompts curated by the PromptCraft community. Browse, upvote, and get inspired by top AI prompts.',
};

export default async function CommunityPromptsPage() {
  const { userId } = await auth();
  const promptService = PromptService.getInstance();
  const prompts = await promptService.getPublicPrompts();

  return <CommunityPromptsClient prompts={prompts} />;
}
