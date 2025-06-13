import { PromptService } from '@/lib/services/promptService';
import PromptHiveLandingClient from '@/components/PromptHiveLandingClient';
import { currentUser } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';

export default async function Page() {
  try {
    const promptService = PromptService.getInstance();
    const featuredPrompts = await promptService.getFeaturedPrompts(3);
    const clerkUser = await currentUser();
    
    const user = clerkUser ? {
      id: clerkUser.id,
      name: clerkUser.firstName + ' ' + clerkUser.lastName,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl
    } : null;

    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-black dark:text-white">
        <main className="flex-1">
          <PromptHiveLandingClient user={user} />
        </main>
      </div>
    );
  } catch (error) {
    Sentry.captureException(error);
    // Optionally, render a fallback UI or rethrow
    return <div>Sorry, something went wrong loading the page.</div>;
  }
}
