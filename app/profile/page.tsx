import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProfileByClerkId } from '@/app/services/profileService';
import { ProfileClient } from './ProfileClient';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { UsageTab } from '@/components/profile/UsageTab';

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  const dbUser = await getProfileByClerkId(userId);

  if (!dbUser) {
    redirect('/sign-in');
  }

  // For active state (simple match for now)
  const currentPath = '/profile';

  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <ProfileClient user={{
        ...dbUser,
        name: dbUser.name ?? '',
        imageUrl: dbUser.imageUrl ?? undefined,
        bio: dbUser.bio ?? undefined,
        jobTitle: dbUser.jobTitle ?? undefined,
        location: dbUser.location ?? undefined,
        company: dbUser.company ?? undefined,
        website: dbUser.website ?? undefined,
        twitter: dbUser.twitter ?? undefined,
        linkedin: dbUser.linkedin ?? undefined
      }} currentPath={currentPath} />
    </Suspense>
  );
}
