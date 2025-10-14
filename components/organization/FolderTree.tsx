'use client'

import { useState } from 'react'
import { Folder, FolderOpen, Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FolderItem {
  id: string
  name: string
  count: number
  children?: FolderItem[]
}

interface FolderTreeProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onFolderSelect: (folderId: string) => void
  onCreateFolder: (name: string, parentId?: string) => void
}

export function FolderTree({ folders, selectedFolderId, onFolderSelect, onCreateFolder }: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setIsCreating(false)
    }
  }

  const renderFolder = (folder: FolderItem, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted transition-colors",
            isSelected && "bg-blue-100 dark:bg-blue-900/20",
            level > 0 && "ml-4"
          )}
          onClick={() => onFolderSelect(folder.id)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) toggleFolder(folder.id)
            }}
          >
            {hasChildren ? (
              isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )}
          </Button>
          <span className="flex-1 text-sm">{folder.name}</span>
          <span className="text-xs text-muted-foreground">{folder.count}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Folders</h3>
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
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewFolderName('')
              }
            }}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
      )}

      <div className="space-y-0.5">
        {folders.map(folder => renderFolder(folder))}
      </div>
    </div>
  )
}
