'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, Plus, User, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/'
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: Search,
    href: '/community-prompts'
  },
  {
    id: 'create',
    label: 'Create',
    icon: Plus,
    href: '/prompts/create'
  },
  {
    id: 'prompts',
    label: 'My Prompts',
    icon: Layers,
    href: '/prompts'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/account'
  }
]

export function BottomTabBar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 text-xs transition-colors relative",
                active 
                  ? "text-purple-600 dark:text-purple-400" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-6 w-6 mb-1",
                  tab.id === 'create' && "h-7 w-7" // Slightly larger create button
                )} />
                {tab.badge && tab.badge > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </div>
                )}
              </div>
              <span className={cn(
                "truncate max-w-full",
                active && "font-medium"
              )}>
                {tab.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
