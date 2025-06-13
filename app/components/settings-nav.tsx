'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface SettingsNavProps {
  items: {
    title: string;
    href: string;
    icon: string;
  }[];
}

export function SettingsNav({ items }: SettingsNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
} 