'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, User, Menu, BookOpen, Users, Layers, LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ThemeToggle } from '../ThemeToggle';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { CommandPalette } from '@/components/ui/command-palette';
import { useClerk } from '@clerk/nextjs';
import LogoutDialog from '@/components/LogoutDialog';

export interface NavBarUser {
  name: string;
  email: string;
  imageUrl?: string;
}

export function NavBar({ user, onMenuClick }: { user?: NavBarUser; onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = { 
    isCommandPaletteOpen: false, 
    setIsCommandPaletteOpen: () => {} 
  };
  const userInitials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-500" />
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
                  CostLens
                </span>
              </Link>
              {user && (
                <div className="hidden items-center gap-4 md:flex">
                  <Link
                    href="/dashboard"
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all hover:scale-105',
                      isActive('/dashboard')
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                        : 'text-muted-foreground hover:bg-blue-100/40 dark:hover:bg-blue-500/10'
                    )}
                  >
                    <Layers className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/docs"
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all hover:scale-105',
                      pathname?.startsWith('/docs')
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                        : 'text-muted-foreground hover:bg-blue-100/40 dark:hover:bg-blue-500/10'
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                    Docs
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl} alt={user?.name} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => setShowLogoutDialog(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/sign-in">
                  <Button variant="outline">Sign In</Button>
                </Link>
              )}
              {user && (
                <button
                  className="rounded-lg p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
                  aria-label="Open menu"
                  onClick={onMenuClick}
                >
                  <Menu className="h-6 w-6 text-blue-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* <CommandPalette 
        open={isCommandPaletteOpen} 
        onOpenChange={setIsCommandPaletteOpen} 
      /> */}
      
      {/* Logout Confirmation Dialog */}
      <LogoutDialog 
        isOpen={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
      />
    </>
  );
}
