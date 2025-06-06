'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './NavBar';
import { useUser } from '@clerk/nextjs';
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
  const { user, isSignedIn } = useUser();
  const { open } = useSidebarStore();

  if (isLandingPage) {
    return null;
  }

  const navUser = isSignedIn
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : undefined;

  return <NavBar user={navUser} onMenuClick={open} />;
}
