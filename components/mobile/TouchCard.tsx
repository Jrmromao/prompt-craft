'use client'

import { useState } from 'react'
import { Heart, Share2, Trash2, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TouchCardProps {
  title: string
  description?: string
  tags?: string[]
  isFavorite?: boolean
  onFavorite?: () => void
  onShare?: () => void
  onDelete?: () => void
  onTap?: () => void
  className?: string
}

export function TouchCard({
  title,
  description,
  tags = [],
  isFavorite = false,
  onFavorite,
  onShare,
  onDelete,
  onTap,
  className
}: TouchCardProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const deltaX = currentX - startX
    const threshold = 50
    
    if (Math.abs(deltaX) > threshold) {
      setShowActions(true)
    } else if (Math.abs(deltaX) < 10) {
      // Tap gesture
      onTap?.()
    }
    
    setIsDragging(false)
    setStartX(0)
    setCurrentX(0)
  }

  const translateX = isDragging ? currentX - startX : 0

  return (
    <div className="relative overflow-hidden">
      <Card
        className={cn(
          "transition-transform duration-200 touch-manipulation",
          showActions && "-translate-x-20",
          className
        )}
        style={{
          transform: `translateX(${translateX}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-base leading-tight pr-2">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Swipe Actions */}
      {showActions && (
        <div className="absolute right-0 top-0 h-full flex items-center bg-gray-100 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className="h-12 w-12 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={() => {
              onDelete?.()
              setShowActions(false)
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-12 w-12 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            onClick={() => {
              onShare?.()
              setShowActions(false)
            }}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-12 w-12 p-0",
              isFavorite 
                ? "text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20" 
                : "hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
            )}
            onClick={() => {
              onFavorite?.()
              setShowActions(false)
            }}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        </div>
      )}
    </div>
  )
}
