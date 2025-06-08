import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { MyPromptsClient } from '@/components/prompts/MyPromptsClient';

export default async function MyPromptsPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in?redirect_url=/prompts/my-prompts');
  }

  const promptService = PromptService.getInstance();
  const prompts = await promptService.getUserPrompts(clerkUser.id);

  return <MyPromptsClient prompts={prompts} />;
} 