'use client';

import { useUser } from '@clerk/nextjs';
import { Role, hasRole } from '@/utils/roles';

export function useRole() {
  const { user, isLoaded } = useUser();
  
  const role = (user?.publicMetadata?.role as Role) || Role.USER;
  
  return {
    role,
    hasRole: (requiredRole: Role) => hasRole(role, requiredRole),
    isLoaded,
    isAdmin: hasRole(role, Role.ADMIN),
    isSuperAdmin: hasRole(role, Role.SUPER_ADMIN)
  };
} 