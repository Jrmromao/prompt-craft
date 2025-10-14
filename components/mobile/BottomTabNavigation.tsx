'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabButtonProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}

const TabButton = ({ href, icon: Icon, label, isActive }: TabButtonProps) => (
  <Link
    href={href}
    className={cn(
      "flex flex-col items-center justify-center min-h-[60px] min-w-[60px] px-2 py-1 rounded-lg transition-colors touch-manipulation",
      isActive 
        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" 
        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    )}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

export const BottomTabNavigation = () => {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/prompts/create', icon: Plus, label: 'Create' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 md:hidden z-50 safe-area-pb">
      <div className="flex justify-around px-2 py-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.href}
            {...tab}
            isActive={pathname === tab.href || pathname.startsWith(tab.href)}
          />
        ))}
      </div>
    </nav>
  );
};
