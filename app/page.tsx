import { PromptService } from '@/lib/services/promptService';
import PromptCraftLandingClient from '@/components/PromptCraftLandingClient';
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const promptService = PromptService.getInstance();
  const featuredPrompts = await promptService.getFeaturedPrompts(3);
  const user = await currentUser();

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-black dark:text-white">
      <main className="flex-1">
        <PromptCraftLandingClient />
      </main>
    </div>
  );
}
