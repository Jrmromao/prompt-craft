import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PromptCreateForm } from '@/components/PromptCreateForm';

export default async function CreatePromptPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Get user and their private prompt count for the current month
  const [user, privatePromptCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, planType: true }
    }),
    prisma.prompt.count({
      where: {
        userId,
        isPublic: false,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // First day of current month
        }
      }
    })
  ]);

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New Prompt</h1>
      <PromptCreateForm user={user} privatePromptCount={privatePromptCount} />
    </div>
  );
}
