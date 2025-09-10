'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from './dialog'
import { Input } from './input'
import { Button } from './button'
import { Plus, Search, Play, Settings, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const commands: CommandItem[] = [
    {
      id: 'create-prompt',
      label: 'Create New Prompt',
      icon: Plus,
      action: () => router.push('/prompts/create'),
      keywords: ['create', 'new', 'prompt', 'add']
    },
    {
      id: 'playground',
      label: 'Open Playground',
      icon: Play,
      action: () => router.push('/playground'),
      keywords: ['playground', 'test', 'run']
    },
    {
      id: 'search',
      label: 'Search Prompts',
      icon: Search,
      action: () => {
        // Focus search bar
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      },
      keywords: ['search', 'find', 'look']
    },
    {
      id: 'home',
      label: 'Go to Home',
      icon: Home,
      action: () => router.push('/'),
      keywords: ['home', 'main', 'start']
    },
    {
      id: 'settings',
      label: 'Open Settings',
      icon: Settings,
      action: () => router.push('/account'),
      keywords: ['settings', 'preferences', 'account']
    }
  ]

  useEffect(() => {
    if (!query) {
      setFilteredItems(commands)
      return
    }

    const filtered = commands.filter(item => {
      const searchText = query.toLowerCase()
      return (
        item.label.toLowerCase().includes(searchText) ||
        item.keywords?.some(keyword => keyword.includes(searchText))
      )
    })

    setFilteredItems(filtered)
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action()
            onOpenChange(false)
            setQuery('')
          }
          break
        case 'Escape':
          onOpenChange(false)
          setQuery('')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredItems, selectedIndex, onOpenChange])

  const handleItemClick = (item: CommandItem) => {
    item.action()
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <div className="border-b">
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 h-12"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="p-2">
              {filteredItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3 text-left",
                      index === selectedIndex && "bg-muted"
                    )}
                    onClick={() => handleItemClick(item)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No commands found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
