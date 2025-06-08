import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return userId;
}
