import { Metadata } from 'next';
import GamifiedCommunityClient from '@/components/prompts/GamifiedCommunityClient';

export const metadata: Metadata = {
  title: 'Community Hub | PromptCraft',
  description:
    'Discover amazing prompts, compete in challenges, earn rewards, and level up in our gamified community hub.',
};

export default function CommunityPromptsPage() {
  return (
    <>
      <GamifiedCommunityClient />
    </>
  );
}
