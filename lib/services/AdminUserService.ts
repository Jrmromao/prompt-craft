import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';
import { UserStatus, Role as PrismaRole } from '@prisma/client';
import { Role, toPrismaRole, fromPrismaRole } from '@/utils/roles';
import { clerkClient } from '@clerk/nextjs/server';

export type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  planType: string;
  status: UserStatus;
  joinedAt: string;
};

interface UserFilters {
  search?: string;
  role?: string;
}

export class AdminUserService {
  private static instance: AdminUserService;

  private constructor() {}

  public static getInstance(): AdminUserService {
    if (!AdminUserService.instance) {
      AdminUserService.instance = new AdminUserService();
    }
    return AdminUserService.instance;
  }

  private parseRole(roleStr: string): Role | undefined {
    return Object.values(Role).includes(roleStr as any) ? (roleStr as unknown as Role) : undefined;
  }

  async getUsers(filters: UserFilters = {}): Promise<UserData[]> {
    try {
      const { search, role } = filters;
      const parsedRole = role ? this.parseRole(role) : undefined;

      const users = await prisma.user.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {},
            parsedRole ? { role: toPrismaRole(parsedRole) } : {},
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          planType: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: fromPrismaRole(user.role),
        planType: user.planType,
        status: user.status,
        joinedAt: user.createdAt.toISOString(),
      }));
    } catch (error) {
      throw new ServiceError('Failed to get users', 'USERS_FETCH_FAILED', 500);
    }
  }

  async updateUserRole(userId: string, newRole: Role, adminId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role: toPrismaRole(newRole) },
      });

      // Log role change
      await prisma.roleChangeLog.create({
        data: {
          userId,
          oldRole: toPrismaRole(newRole), // This should be fetched first in a real implementation
          newRole: toPrismaRole(newRole),
          changedBy: adminId,
          action: 'ROLE_UPDATE',
        },
      });
    } catch (error) {
      throw new ServiceError('Failed to update user role', 'USER_ROLE_UPDATE_FAILED', 500);
    }
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status },
      });
    } catch (error) {
      throw new ServiceError('Failed to update user status', 'USER_STATUS_UPDATE_FAILED', 500);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete from Clerk first
      await clerkClient.users.deleteUser(userId);
      
      // Then delete from database
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      throw new ServiceError('Failed to delete user', 'USER_DELETE_FAILED', 500);
    }
  }
}
