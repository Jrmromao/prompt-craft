'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './NavBar';
import { useAuth } from '@/hooks/useAuth';
import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>(set => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export function NavBarWrapper() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { user, isAuthenticated } = useAuth();
  const { open } = useSidebarStore();

  if (isLandingPage) {
    return null;
  }

  const navUser = isAuthenticated && user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.email || '',
        imageUrl: user.imageUrl || undefined,
      }
    : undefined;

  return <NavBar user={navUser} onMenuClick={open} />;
}
