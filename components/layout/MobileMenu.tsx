'use client';

import { BookOpen, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav className="mt-6 flex flex-col gap-2">
          <Link
            href="/prompts/my-prompts"
            onClick={onClose}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
              isActive('/prompts/my-prompts')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <BookOpen className="h-4 w-4" />
            My Prompts
          </Link>
          <Link
            href="/community-prompts"
            onClick={onClose}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
              isActive('/prompts/community')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Users className="h-4 w-4" />
            Community
          </Link>
        </nav>
      </div>
    </div>
  );
} 