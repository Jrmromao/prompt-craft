'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const navItems = [
  {
    name: 'Tickets',
    href: '/support',
  },
  {
    name: 'Knowledge Base',
    href: '/support/kb',
  },
];

export function SupportNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b pb-4">
      <nav className="flex items-center space-x-4">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <Link href="/settings">
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </Link>
    </div>
  );
}
