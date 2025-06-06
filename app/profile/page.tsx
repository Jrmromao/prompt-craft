import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProfileByClerkId } from '@/app/services/profileService';
import { ProfileClient } from './ProfileClient';
import { Suspense } from 'react';

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
      <ProfileClient
        user={{
          id: dbUser.id,
          name: dbUser.name || '',
          email: dbUser.email,
          imageUrl: user.imageUrl,
          role: dbUser.role,
          planType: dbUser.planType,
          credits: dbUser.credits,
          creditCap: dbUser.creditCap,
          bio: dbUser.bio || undefined,
          jobTitle: dbUser.jobTitle || undefined,
          location: dbUser.location || undefined,
          company: dbUser.company || undefined,
          website: dbUser.website || undefined,
          twitter: dbUser.twitter || undefined,
          linkedin: dbUser.linkedin || undefined,
        }}
        currentPath={currentPath}
      />
    </Suspense>
  );
}
