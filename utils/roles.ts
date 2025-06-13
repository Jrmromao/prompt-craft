import { Role as PrismaRole } from '@prisma/client';

export enum Role {
  USER,
  ADMIN,
  SUPER_ADMIN,
}

// Map our Role enum to Prisma's Role enum
export const toPrismaRole = (role: Role): PrismaRole => role as unknown as PrismaRole;
export const fromPrismaRole = (role: PrismaRole): Role => role as unknown as Role;

export enum Permission {
  VIEW_USERS = 'VIEW_USERS',
  EDIT_USERS = 'EDIT_USERS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_ROLES = 'MANAGE_ROLES',
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [],
  [Role.ADMIN]: [Permission.VIEW_USERS, Permission.EDIT_USERS, Permission.VIEW_ANALYTICS],
  [Role.SUPER_ADMIN]: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_ROLES,
  ],
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const hierarchy = [Role.USER, Role.ADMIN, Role.SUPER_ADMIN];
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(requiredRole);
}

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return RolePermissions[userRole]?.includes(permission);
} 