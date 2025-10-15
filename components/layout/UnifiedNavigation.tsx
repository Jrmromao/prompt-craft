'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { NavBar } from './NavBar'
import { BottomTabBar } from '../mobile/BottomTabBar'
import { useEffect, useState } from 'react'

export function UnifiedNavigation() {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [isClient, setIsClient] = useState(false)
  
  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const isLandingPage = pathname === '/'
  if (isLandingPage || !isClient) {
    return null
  }

  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <div className="hidden md:block">
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-pulse" />
      </div>
    )
  }

  // Prepare user data for NavBar
  const navUser = user
    ? {
        name: user.firstName && user.lastName 
          ? [user.firstName, user.lastName].filter(Boolean).join(' ')
          : user.username || 'User',
        email: user.emailAddresses[0]?.emailAddress || '',
        imageUrl: user.imageUrl || undefined,
      }
    : undefined

  return (
    <>
      {/* Desktop Navigation */}
      <NavBar user={navUser} />
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomTabBar />
      </div>
    </>
  )
}
