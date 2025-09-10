'use client'

import { useState } from 'react'
import { Trash2, FolderPlus, Star, Download, Share2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface BulkActionsProps {
  selectedItems: string[]
  totalItems: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkDelete: (ids: string[]) => void
  onBulkMoveToFolder: (ids: string[], folderId: string) => void
  onBulkAddToFavorites: (ids: string[]) => void
  onBulkExport: (ids: string[]) => void
  onBulkShare: (ids: string[]) => void
}

export function BulkActions({
  selectedItems,
  totalItems,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkMoveToFolder,
  onBulkAddToFavorites,
  onBulkExport,
  onBulkShare
}: BulkActionsProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  
  const hasSelection = selectedItems.length > 0
  const isAllSelected = selectedItems.length === totalItems && totalItems > 0

  if (!hasSelection) {
    return (
      <div className="flex items-center gap-2 p-2 border-b">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectAll()
            } else {
              onDeselectAll()
            }
          }}
        />
        <span className="text-sm text-muted-foreground">
          Select items for bulk actions
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2 border-b bg-purple-50 dark:bg-purple-950/20">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectAll()
            } else {
              onDeselectAll()
            }
          }}
        />
        <Badge variant="secondary">
          {selectedItems.length} selected
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onBulkAddToFavorites(selectedItems)}
          className="h-8"
        >
          <Star className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onBulkExport(selectedItems)}
          className="h-8"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onBulkShare(selectedItems)}
          className="h-8"
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBulkMoveToFolder(selectedItems, 'work')}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Move to Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onBulkDelete(selectedItems)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="h-8 text-xs"
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
