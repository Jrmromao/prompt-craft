'use client'

import { useState } from 'react'
import { Tag, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagItem {
  id: string
  name: string
  count: number
  color?: string
}

interface TagManagerProps {
  tags: TagItem[]
  selectedTags: string[]
  onTagSelect: (tagId: string) => void
  onTagDeselect: (tagId: string) => void
  onCreateTag: (name: string) => void
}

export function TagManager({ tags, selectedTags, onTagSelect, onTagDeselect, onCreateTag }: TagManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim())
      setNewTagName('')
      setIsCreating(false)
    }
  }

  const popularTags = tags.sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isCreating && (
        <div className="flex gap-2">
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTag()
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewTagName('')
              }
            }}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Selected:</div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tagId) => {
              const tag = tags.find(t => t.id === tagId)
              if (!tag) return null
              return (
                <Badge
                  key={tagId}
                  variant="default"
                  className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                    onClick={() => onTagDeselect(tagId)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Popular tags:</div>
        <div className="flex flex-wrap gap-1">
          {popularTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id)
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "text-xs cursor-pointer transition-colors",
                  isSelected 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
                )}
                onClick={() => {
                  if (isSelected) {
                    onTagDeselect(tag.id)
                  } else {
                    onTagSelect(tag.id)
                  }
                }}
              >
                {tag.name} ({tag.count})
              </Badge>
            )
          })}
        </div>
      </div>
    </div>
  )
}
