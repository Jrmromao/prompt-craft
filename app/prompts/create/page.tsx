import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import ClientWrapper from './ClientWrapper';
import type { NavBarUser } from '@/components/layout/NavBar';

export default async function CreatePromptPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const navBarUser: NavBarUser = {
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    imageUrl: user?.imageUrl,
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientWrapper user={navBarUser} />
    </div>
  );
}
