import { auth } from '@clerk/nextjs/server';
import { Role } from './roles';

export async function checkRole(requiredRole: Role): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const { sessionClaims } = await auth();
  const userRole = (sessionClaims?.metadata as { role?: Role } | undefined)?.role || Role.USER;

  return hasRole(userRole, requiredRole);
}

export async function getCurrentRole(): Promise<Role> {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata as { role?: Role } | undefined)?.role || Role.USER;
}

export async function requireRole(requiredRole: Role) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const userRole = (sessionClaims?.metadata as { role?: Role } | undefined)?.role || Role.USER;
  if (!hasRole(userRole, requiredRole)) {
    throw new Error('Forbidden');
  }

  return { userId, role: userRole };
}

function hasRole(userRole: Role, requiredRole: Role): boolean {
  const hierarchy = [Role.USER, Role.ADMIN, Role.SUPER_ADMIN];
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(requiredRole);
} 