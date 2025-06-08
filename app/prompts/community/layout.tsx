import { NavBar } from '@/components/layout/NavBar';
import { currentUser } from '@clerk/nextjs/server';

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  const user = clerkUser
    ? {
        name: clerkUser.fullName || clerkUser.username || 'User',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />
      {children}
    </div>
  );
} 