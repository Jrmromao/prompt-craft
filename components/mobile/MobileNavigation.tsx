'use client'

import { useState } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { SwipeableDrawer } from './SwipeableDrawer'
import { ContentOrganizer } from '@/components/organization/ContentOrganizer'

interface MobileNavigationProps {
  children: React.ReactNode
  showBottomTabs?: boolean
}

export function MobileNavigation({ children, showBottomTabs = true }: MobileNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      {children}
      
      {showBottomTabs && <BottomTabBar />}
      
      <SwipeableDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Organization"
      >
        <ContentOrganizer />
      </SwipeableDrawer>
    </>
  )
}
