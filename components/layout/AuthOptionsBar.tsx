'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AuthOptionsBar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
                PromptHive
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-up">
              <Button variant="default">Sign Up</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
