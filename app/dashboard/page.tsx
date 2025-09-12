import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardClient } from './DashboardClient';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Get or create user in database
  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: clerkUser.id,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl,
    },
  });

  return (
    <>
      <WelcomeModal user={{
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        credits: user.monthlyCredits + user.purchasedCredits,
        creditCap: user.creditCap,
        planType: user.planType,
      }} />
      <DashboardClient user={{
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        createdAt: user.createdAt,
        credits: user.monthlyCredits + user.purchasedCredits,
        creditCap: user.creditCap,
        planType: user.planType,
      }} />
    </>
  );
}
