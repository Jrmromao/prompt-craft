'use client'

import { useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  interactionTime: number
}

export function usePerformanceOptimization() {
  const metricsRef = useRef<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  })

  // Measure component render time
  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
      }
      
      metricsRef.current.renderTime = renderTime
    }
  }, [])

  // Debounce function for expensive operations
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }, [])

  // Throttle function for scroll/resize events
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }, [])

  // Lazy load images
  const lazyLoadImage = useCallback((src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = reject
      img.src = src
    })
  }, [])

  // Preload critical resources
  const preloadResource = useCallback((href: string, as: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }, [])

  // Monitor performance
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          metricsRef.current.loadTime = entry.duration
        }
      }
    })

    observer.observe({ entryTypes: ['navigation', 'measure'] })
    
    return () => observer.disconnect()
  }, [])

  return {
    measureRender,
    debounce,
    throttle,
    lazyLoadImage,
    preloadResource,
    metrics: metricsRef.current
  }
}
