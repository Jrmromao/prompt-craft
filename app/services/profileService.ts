import { prisma } from '@/lib/prisma';

export interface ProfileData {
  id: string;
  clerkId: string;
  name: string | null;
  email: string;
  bio: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProfileByClerkId(clerkId: string): Promise<ProfileData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfile(clerkId: string, data: Partial<ProfileData>): Promise<ProfileData | null> {
  try {
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name: data.name,
        bio: data.bio,
        avatar: data.avatar,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}
