'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Zap, Code, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs', icon: Home },
      { title: 'Quick Start', href: '/docs/quickstart', icon: Zap },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'OpenAI Integration', href: '/docs/openai', icon: BookOpen },
      { title: 'Anthropic Integration', href: '/docs/anthropic', icon: BookOpen },
      { title: 'Error Tracking', href: '/docs/errors', icon: FileText },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'SDK Reference', href: '/docs/sdk', icon: Code },
      { title: 'REST API', href: '/docs/api', icon: Code },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-gray-50">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mb-6">
            <Link href="/docs" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">Documentation</span>
            </Link>
          </div>
          <nav className="flex-1 px-2 space-y-6">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <Icon className={cn('mr-3 h-4 w-4', isActive ? 'text-blue-700' : 'text-gray-400')} />
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
