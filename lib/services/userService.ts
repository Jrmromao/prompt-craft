import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';
import { User } from '@prisma/client';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getOrCreateUser(clerkUser: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
    imageUrl?: string;
  }): Promise<User> {
    try {
      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          imageUrl: clerkUser.imageUrl,
        },
        create: {
          clerkId: clerkUser.id,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          imageUrl: clerkUser.imageUrl,
        },
      });

      return user;
    } catch (error) {
      throw new ServiceError('Failed to get or create user', 'USER_OPERATION_FAILED', 500);
    }
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { clerkId }
      });
    } catch (error) {
      throw new ServiceError('Failed to get user', 'USER_NOT_FOUND', 404);
    }
  }
}
