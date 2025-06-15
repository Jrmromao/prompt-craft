'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, MessageSquare, Sparkles, Users, Star, Clock, Edit, Trash, Plus, MoreVertical, Share2, X, Tag, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PromptSearchBar } from './PromptSearchBar';
import { Prompt } from '@/types/prompt';


interface MyPromptsClientProps {
  prompts: Prompt[];
}

export function MyPromptsClient({ prompts }: MyPromptsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSelectorOpen, setTagSelectorOpen] = useState(false);

  // Get unique tag objects from all prompts
  const allTags = Array.from(
    new Map(prompts.flatMap(p => p.tags).map(tag => [tag.id, tag])).values()
  );

  // Filter prompts based on search, tags, and active tab
  const filteredPrompts = prompts.filter(prompt => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      prompt.name.toLowerCase().includes(searchLower) ||
      prompt.description?.toLowerCase().includes(searchLower) ||
      prompt.tags.some((tag: { name: string }) => tag.name.toLowerCase().includes(searchLower));
    
    const matchesTab = activeTab === 'all' || prompt.status === activeTab;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every((tag: string) => prompt.tags.some((t: { name: string }) => t.name === tag));
    
    return matchesSearch && matchesTab && matchesTags;
  });

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === 'popular') return b._count.votes - a._count.votes;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent py-16">
        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/40 px-4 py-2 dark:border-purple-500/20 dark:bg-purple-500/10">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                My Prompts
              </span>
            </div>
            <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              Your Prompt Collection
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Manage and organize your prompts. Edit, share, and track their performance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/prompts/create">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create New Prompt
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-purple-200 hover:bg-purple-100/40 dark:border-purple-500/20 dark:hover:bg-purple-500/10"
              >
                <Link href="/community-prompts">
                  <Users className="mr-2 h-4 w-4" />
                  Browse Community
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-pink-500/5 to-transparent" />
      </div>

      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      
        {/* Simplified Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <PromptSearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <Popover open={tagSelectorOpen} onOpenChange={setTagSelectorOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Filter by Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="max-h-48 overflow-y-auto">
                  {allTags.map((tag: { id: string; name: string }) => (
                    <div
                      key={tag.id}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-muted ${selectedTags.includes(tag.name) ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300' : ''}`}
                      onClick={() => {
                        if (!selectedTags.includes(tag.name)) {
                          setSelectedTags(prev => [...prev, tag.name]);
                          setTagSelectorOpen(false);
                        }
                      }}
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag.name}</span>
                      {selectedTags.includes(tag.name) && <span className="ml-auto text-xs">✓</span>}
                    </div>
                  ))}
                  {allTags.length === 0 && (
                    <div className="text-muted-foreground text-sm px-2 py-1">No tags available</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2">
              {selectedTags.slice(0, 3).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-500/10 dark:text-purple-300"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                  />
                </Badge>
              ))}
              {selectedTags.length > 3 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer">
                      +{selectedTags.length - 3} more
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="flex flex-wrap gap-2 max-w-xs">
                    {selectedTags.slice(3).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-500/10 dark:text-purple-300"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                        />
                      </Badge>
                    ))}
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Sort by: {sortBy === 'recent' ? 'Recent' : 'Popular'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('recent')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('popular')}>
                  <Star className="mr-2 h-4 w-4" />
                  Popular
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Prompts Grid */}
        <TooltipProvider>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + sortBy}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {sortedPrompts.map((prompt: Prompt) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group relative h-full overflow-hidden border-purple-200 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 dark:border-purple-500/20">
                  <CardHeader>
                    <div className="absolute right-4 top-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="line-clamp-1 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-500 dark:from-purple-300 dark:to-pink-300">
                      {prompt.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.slice(0, 2).map((tag: { id: string; name: string }) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="border-purple-200 bg-purple-100/40 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {prompt.tags.length > 2 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="border-purple-200 bg-purple-100/40 text-purple-700 cursor-pointer dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                            >
                              +{prompt.tags.length - 2}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {prompt.tags.slice(2).map((tag: { id: string; name: string }) => (
                                <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 ring-2 ring-purple-200 dark:ring-purple-500/20">
                        <AvatarImage src={prompt.user.imageUrl || undefined} alt={prompt.user.name || 'User'} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                          {prompt.user.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{prompt.user.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{prompt._count.votes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                        {/* <span>{prompt._count.comments || 0}</span> */}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        </TooltipProvider>

        {sortedPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-500/10">
              <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No prompts found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Create your first prompt to get started'}
            </p>
            {!searchQuery && (
              <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="mr-2 h-4 w-4" />
                Create New Prompt
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 