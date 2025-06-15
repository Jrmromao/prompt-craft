import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ProfileService } from '@/lib/services/profileService';
import { ProfileClient } from './ProfileClient';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { UsageTab } from '@/components/profile/UsageTab';

export default async function ProfilePage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    redirect('/sign-in');
  }

  const dbUser = await ProfileService.getInstance().getProfileByClerkId(userId);

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Prefer Clerk's imageUrl if available
  const user = {
    ...dbUser,
    imageUrl: clerkUser.imageUrl ?? dbUser.imageUrl ?? undefined,
    name: dbUser.name ?? '',
    bio: dbUser.bio ?? undefined,
    jobTitle: dbUser.jobTitle ?? undefined,
    location: dbUser.location ?? undefined,
    company: dbUser.company ?? undefined,
    website: dbUser.website ?? undefined,
    twitter: dbUser.twitter ?? undefined,
    linkedin: dbUser.linkedin ?? undefined
  };

  const currentPath = '/profile';

  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <ProfileClient user={user} currentPath={currentPath} />
    </Suspense>
  );
}
