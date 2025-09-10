import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Get or create user in database
  const user = await prisma.user.upsert({
    where: { id: clerkUser.id },
    update: {
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl,
    },
  });

  return (
    <>
      <WelcomeModal user={user} />
      <DashboardClient user={user} />
    </>
  );
}
