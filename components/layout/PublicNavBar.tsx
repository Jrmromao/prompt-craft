'use client';
import Link from 'next/link';
import { Sparkles, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function PublicNavBar() {
  const { user, isAuthenticated } = useAuth();
  const userInitials = user?.firstName?.[0] + (user?.lastName?.[0] || '');

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
              PromptHive
            </span>
          </Link>
          {/* Navigation Links */}
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="transition-colors hover:text-blue-600">
              Home
            </Link>
              Blog
            </Link>
              About
            </Link>
              Careers
            </Link>
              Contact
            </Link>
          </div>
          {/* Theme Toggle & Auth */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl || undefined} alt={user?.firstName || 'User'} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        No email
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/signout', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        if (response.ok) {
                          window.location.href = '/sign-in';
                        }
                      } catch (error) {
                        console.error('Sign out error:', error);
                      }
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" className="ml-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Mobile Nav */}
        <div className="flex justify-center gap-4 border-t border-border bg-white py-2 text-sm font-medium dark:bg-gray-900 md:hidden">
          <Link href="/" className="transition-colors hover:text-blue-600">
            Home
          </Link>
            Blog
          </Link>
            About
          </Link>
            Careers
          </Link>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
