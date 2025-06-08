'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role, Prisma, UserStatus } from '@prisma/client';

export type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  planType: string;
  status: UserStatus;
  joinedAt: string;
};

export async function getUsers(searchParams: { search?: string; role?: string }) {
  const search = searchParams.search;
  const role = searchParams.role;

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
      role ? { role: role as Role } : {},
    ],
  };

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return users.map(user => ({
      ...user,
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
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath('/admin/users');
    return user;
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
        role: data.role,
      },
    });
    revalidatePath('/admin/users');
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}
