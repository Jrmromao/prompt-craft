import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserService } from '@/lib/services/UserService';
import { DashboardClient } from './DashboardClient';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Get or create user using service
  const userService = UserService.getInstance();
  const user = await userService.getOrCreateUser(clerkUser);

  return (
    <>
      <WelcomeModal user={{
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        createdAt: user.createdAt,
      }} />
      <DashboardClient 
        user={{
          name: user.name || 'User',
          email: user.email,
          credits: 0, // Default value
          creditCap: 100, // Default value
          planType: 'FREE', // Default value
        }}
        recentPrompts={[]} // Empty array for now
      />
    </>
  );
}
