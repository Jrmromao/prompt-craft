import { prisma } from '@/lib/prisma';
import { Role, UserStatus } from '@prisma/client';

// Helper function to convert Prisma role to display role
function fromPrismaRole(role: Role): string {
  return role;
}

export interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  joinedAt: string;
}

export async function getUsers(filters?: {
  search?: string;
  role?: string;
  status?: string;
}) {
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.role && filters.role !== 'all') {
    where.role = filters.role;
  }

  if (filters?.status && filters.status !== 'all') {
    where.isActive = filters.status === 'active';
  }

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return users.map(user => ({
      ...user,
      role: user.role,
      joinedAt: user.createdAt.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
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
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

// Alias for backward compatibility
export const updateUser = updateUserRole;
