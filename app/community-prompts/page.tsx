import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { PromptService } from '@/lib/services/promptService';
import { CommunityPromptsClient } from '@/components/prompts/CommunityPromptsClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Prompts | PromptHive',
  description:
    'Discover the best public prompts curated by the PromptHive community. Browse, upvote, and get inspired by top AI prompts.',
};

export default async function CommunityPromptsPage() {
  try {
    const { userId } = await auth();
    const promptService = PromptService.getInstance();
    const { prompts, total } = await promptService.getPublicPrompts(1, 10);

    if (!prompts) {
      throw new Error('No prompts found');
    }

    return <CommunityPromptsClient initialPrompts={prompts} totalPrompts={total} />;
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load prompts. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
