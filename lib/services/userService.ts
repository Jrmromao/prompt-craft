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

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { clerkId },
      });
    } catch (error) {
      throw new ServiceError('Failed to get user', 'USER_NOT_FOUND', 404);
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      throw new ServiceError('Failed to get user by username', 'USER_NOT_FOUND', 404);
    }
  }

  async getDatabaseIdFromClerk(clerkId: string): Promise<string | null> {
    try {
      const user = await this.getUserByClerkId(clerkId);
      return user?.id || null;
    } catch (error) {
      return null;
    }
  }

  async getCreditHistory(clerkId: string) {
    try {
      // Return empty array for now - implement when credit history model is available
      return [];
    } catch (error) {
      throw new ServiceError('Failed to get credit history', 'CREDIT_HISTORY_FAILED', 500);
    }
  }

  async getOrCreateUser(clerkUser: any): Promise<User> {
    try {
      let user = await this.getUserByClerkId(clerkUser.id);
      
      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: clerkUser.firstName && clerkUser.lastName 
              ? `${clerkUser.firstName} ${clerkUser.lastName}` 
              : clerkUser.firstName || clerkUser.lastName || null,
            username: clerkUser.username || clerkUser.id,
          },
        });
      }
      
      return user;
    } catch (error) {
      throw new ServiceError('Failed to get or create user', 'USER_CREATION_FAILED', 500);
    }
  }
}
