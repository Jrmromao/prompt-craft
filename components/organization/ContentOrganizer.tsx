'use client'

import { useState } from 'react'
import { FolderTree } from './FolderTree'
import { FavoritesList } from './FavoritesList'
import { TagManager } from './TagManager'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ContentOrganizerProps {
  className?: string
}

// Mock data - replace with real data from API
const mockFolders = [
  { id: '1', name: 'Work Projects', count: 12 },
  { id: '2', name: 'Personal', count: 5 },
  { id: '3', name: 'Templates', count: 8 },
]

const mockFavorites = [
  {
    id: '1',
    name: 'Blog Post Writer',
    description: 'Creates engaging blog posts',
    createdAt: new Date()
  },
  {
    id: '2', 
    name: 'Code Reviewer',
    description: 'Reviews code for best practices',
    createdAt: new Date()
  }
]

const mockTags = [
  { id: '1', name: 'writing', count: 15 },
  { id: '2', name: 'coding', count: 12 },
  { id: '3', name: 'marketing', count: 8 },
  { id: '4', name: 'analysis', count: 6 },
  { id: '5', name: 'creative', count: 4 },
]

export function ContentOrganizer({ className }: ContentOrganizerProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    // TODO: Filter content by folder
  }

  const handleCreateFolder = (name: string, parentId?: string) => {
    // TODO: Create folder via API
  }

  const handleSelectFavorite = (promptId: string) => {
    // TODO: Navigate to prompt
  }

  const handleRemoveFavorite = (promptId: string) => {
    // TODO: Remove from favorites via API
  }

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => [...prev, tagId])
    // TODO: Filter content by tags
  }

  const handleTagDeselect = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId))
    // TODO: Update content filter
  }

  const handleCreateTag = (name: string) => {
    // TODO: Create tag via API
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <FolderTree
          folders={mockFolders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          onCreateFolder={handleCreateFolder}
        />
        
        <Separator />
        
        <FavoritesList
          favorites={mockFavorites}
          onSelectFavorite={handleSelectFavorite}
          onRemoveFavorite={handleRemoveFavorite}
        />
        
        <Separator />
        
        <TagManager
          tags={mockTags}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onTagDeselect={handleTagDeselect}
          onCreateTag={handleCreateTag}
        />
      </CardContent>
    </Card>
  )
}
