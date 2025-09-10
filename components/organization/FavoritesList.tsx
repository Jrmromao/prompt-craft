'use client'

import { Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FavoritePrompt {
  id: string
  name: string
  description?: string
  createdAt: Date
}

interface FavoritesListProps {
  favorites: FavoritePrompt[]
  onSelectFavorite: (promptId: string) => void
  onRemoveFavorite: (promptId: string) => void
}

export function FavoritesList({ favorites, onSelectFavorite, onRemoveFavorite }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Favorites</h3>
        <div className="text-xs text-muted-foreground p-2 text-center">
          No favorites yet. Star prompts to add them here.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Star className="h-4 w-4" />
        Favorites
      </h3>
      <div className="space-y-1">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer group"
            onClick={() => onSelectFavorite(favorite.id)}
          >
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{favorite.name}</div>
              {favorite.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {favorite.description}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFavorite(favorite.id)
              }}
            >
              <Heart className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
