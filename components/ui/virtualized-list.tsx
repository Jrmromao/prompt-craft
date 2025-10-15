'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight?: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  className?: string
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  onLoadMore,
  hasMore = false,
  loading = false,
  className
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const totalHeight = items.length * itemHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    setIsScrolling(true)

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)

    // Load more when near bottom
    if (onLoadMore && hasMore && !loading) {
      const { scrollHeight, clientHeight } = e.currentTarget
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
      
      if (scrollPercentage > 0.8) {
        onLoadMore()
      }
    }
  }, [onLoadMore, hasMore, loading])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{
                height: itemHeight,
                overflow: 'hidden',
              }}
              className={cn(
                "transition-opacity duration-200",
                isScrolling ? "opacity-90" : "opacity-100"
              )}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div
            className="flex items-center justify-center py-4"
            style={{
              position: 'absolute',
              top: items.length * itemHeight,
              left: 0,
              right: 0,
            }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Loading more...
            </div>
          </div>
        )}

        {/* End of list indicator */}
        {!hasMore && items.length > 0 && (
          <div
            className="flex items-center justify-center py-4 text-sm text-muted-foreground"
            style={{
              position: 'absolute',
              top: items.length * itemHeight,
              left: 0,
              right: 0,
            }}
          >
            You've reached the end
          </div>
        )}
      </div>
    </div>
  )
}
