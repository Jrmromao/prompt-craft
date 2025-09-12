'use server';

import { AdminUserService, UserData } from '@/lib/services/AdminUserService';
import { revalidatePath } from 'next/cache';
import { UserStatus } from '@prisma/client';
import { Role } from '@/utils/roles';
import { requireRole } from '@/utils/roles.server';

export type { UserData };

export async function getUsers(searchParams: { search?: string; role?: string }): Promise<UserData[]> {
  try {
    const adminUserService = AdminUserService.getInstance();
    return await adminUserService.getUsers(searchParams);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

  const where: Prisma.UserWhereInput = {
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
  };

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return users.map(user => ({
      ...user,
      role: fromPrismaRole(user.role),
      joinedAt: user.createdAt.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: isActive ? UserStatus.ACTIVE : UserStatus.SUSPENDED },
    });
    revalidatePath('/admin/users');
    return user;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
}

export async function updateUserRole(userId: string, role: Role) {
  const currentUser = await requireRole(Role.ADMIN);
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  if ((role === Role.ADMIN || role === Role.SUPER_ADMIN) && !hasRole(currentUser.role, Role.SUPER_ADMIN)) {
    throw new Error('Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles');
  }

  try {
    // Update role in Clerk metadata
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role },
    });

    // Update role in database
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: toPrismaRole(role) },
    });

    // Log role change (audit trail)
    console.log(`User ${currentUser.userId} changed role of ${userId} to ${role}`);
    revalidatePath('/admin/users');
    return { ...user, role: fromPrismaRole(user.role) };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

export async function updateUser(userId: string, data: { name: string; role: Role }) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: toPrismaRole(data.role),
      },
    });
    revalidatePath('/admin/users');
    return { ...user, role: fromPrismaRole(user.role) };
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}
