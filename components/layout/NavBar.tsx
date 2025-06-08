'use client';
import Link from 'next/link';
import { Sparkles, User, LogOut, Menu, BookOpen, Users } from 'lucide-react';
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
import { useClerk } from '@clerk/nextjs';
import { ThemeToggle } from '../ThemeToggle';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';
import { useState } from 'react';

export interface NavBarUser {
  name: string;
  email: string;
  imageUrl?: string;
}

export function NavBar({ user }: { user?: NavBarUser }) {
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
              <Link href="/dashboard" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent">
                  PromptCraft
                </span>
              </Link>
              {user && (
                <div className="hidden items-center gap-4 md:flex">
                  <Link
                    href="/prompts/my-prompts"
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all hover:scale-105',
                      isActive('/prompts/my-prompts')
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'text-muted-foreground hover:bg-purple-100/40 dark:hover:bg-purple-500/10'
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                    My Prompts
                  </Link>
                  <Link
                    href="/community-prompts"
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all hover:scale-105',
                      isActive('/community-prompts')
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'text-muted-foreground hover:bg-purple-100/40 dark:hover:bg-purple-500/10'
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Community
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
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 dark:text-red-400"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
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
                  className="rounded-lg p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-purple-500 md:hidden"
                  aria-label="Open menu"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-6 w-6 text-purple-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
