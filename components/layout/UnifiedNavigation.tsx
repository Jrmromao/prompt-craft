'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { NavBar } from './NavBar'
import { BottomTabBar } from '../mobile/BottomTabBar'

export function UnifiedNavigation() {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const isLandingPage = pathname === '/'
  if (isLandingPage) {
    return null
  }

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="hidden md:block">
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-pulse" />
      </div>
    )
  }

  // Prepare user data for NavBar
  const navUser = isAuthenticated && user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.email || '',
        imageUrl: user.imageUrl || undefined,
      }
    : undefined

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavBar user={navUser} />
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomTabBar />
      </div>
    </>
  )
}
