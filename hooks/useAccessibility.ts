'use client'

import { useEffect, useCallback, useRef } from 'react'

export function useAccessibility() {
  const announcementRef = useRef<HTMLDivElement | null>(null)

  // Create screen reader announcement
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      const div = document.createElement('div')
      div.setAttribute('aria-live', priority)
      div.setAttribute('aria-atomic', 'true')
      div.className = 'sr-only'
      document.body.appendChild(div)
      announcementRef.current = div
    }

    announcementRef.current.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = ''
      }
    }, 1000)
  }, [])

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  // Keyboard navigation
  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    handlers: Record<string, () => void>
  ) => {
    const key = event.key
    if (handlers[key]) {
      event.preventDefault()
      handlers[key]()
    }
  }, [])

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, text: string) => {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-50'
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      focusElement(`#${targetId}`)
    })
    
    return skipLink
  }, [focusElement])

  // Color contrast checker
  const checkContrast = useCallback((foreground: string, background: string): boolean => {
    // Simplified contrast ratio calculation
    const getLuminance = (color: string) => {
      const rgb = parseInt(color.replace('#', ''), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    
    return ratio >= 4.5 // WCAG AA standard
  }, [])

  // Reduced motion detection
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // High contrast mode detection
  const prefersHighContrast = useCallback(() => {
    return window.matchMedia('(prefers-contrast: high)').matches
  }, [])

  // Setup accessibility features
  useEffect(() => {
    // Add skip links
    const mainContent = document.querySelector('main')
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content'
    }

    const skipLink = createSkipLink('main-content', 'Skip to main content')
    document.body.insertBefore(skipLink, document.body.firstChild)

    // Global keyboard shortcuts
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Alt + M for main content
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        focusElement('#main-content')
        announce('Jumped to main content')
      }
      
      // Alt + N for navigation
      if (e.altKey && e.key === 'n') {
        e.preventDefault()
        focusElement('nav')
        announce('Jumped to navigation')
      }
    }

    document.addEventListener('keydown', handleGlobalKeys)

    return () => {
      document.removeEventListener('keydown', handleGlobalKeys)
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current)
      }
    }
  }, [announce, createSkipLink, focusElement])

  return {
    announce,
    focusElement,
    handleKeyboardNavigation,
    checkContrast,
    prefersReducedMotion,
    prefersHighContrast
  }
}
