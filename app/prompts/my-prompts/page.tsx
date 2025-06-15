import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { MyPromptsClient } from '@/components/prompts/MyPromptsClient';
import { UserService } from '@/lib/services/userService';

export default async function MyPromptsPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in?redirect_url=/prompts/my-prompts');
  }

  // Get database user ID securely through UserService
  const userService = UserService.getInstance();
  const databaseUserId = await userService.getDatabaseIdFromClerk(clerkUser.id);

  if (!databaseUserId) {
    console.error('Database user ID not found for Clerk user:', clerkUser.id);
    redirect('/error?message=User not found');
  }

  const promptService = PromptService.getInstance();
  const prompts = await promptService.getUserPrompts(databaseUserId);

  return <MyPromptsClient prompts={prompts} />;
} 