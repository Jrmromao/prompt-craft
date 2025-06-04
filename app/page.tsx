import { PromptService } from '@/lib/services/promptService';
import PromptCraftLandingClient from '@/components/PromptCraftLandingClient';
import { NavBar } from '@/components/layout/NavBar';
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const promptService = PromptService.getInstance();
  const featuredPrompts = await promptService.getFeaturedPrompts(3);
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
      <NavBar user={navUser} />
      <main className="flex-1">
        <PromptCraftLandingClient />
      </main>
    </div>
  );
}