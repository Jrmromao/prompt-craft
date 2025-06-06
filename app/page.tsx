import { PromptService } from '@/lib/services/promptService';
import PromptCraftLandingClient from '@/components/PromptCraftLandingClient';
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const promptService = PromptService.getInstance();
  const featuredPrompts = await promptService.getFeaturedPrompts(3);
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col">
      <main className="flex-1">
        <PromptCraftLandingClient />
      </main>
    </div>
  );
}