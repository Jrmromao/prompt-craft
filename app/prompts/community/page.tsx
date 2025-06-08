import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { CommunityPromptsClient } from '@/components/prompts/CommunityPromptsClient';

export default async function CommunityPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in?redirect_url=/prompts/community');
  }

  const promptService = PromptService.getInstance();
  const prompts = await promptService.getPublicPrompts();

  return <CommunityPromptsClient prompts={prompts} />;
} 