'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, FileText, User, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  type: 'prompt' | 'user';
  title?: string;
  name?: string;
  description?: string;
  email?: string;
  relevance: number;
  createdAt: string;
  _count?: {
    likes?: number;
    uses?: number;
    prompts?: number;
    followers?: number;
  };
}

interface SearchResponse {
  success: boolean;
  data: {
    prompts: SearchResult[];
    users: SearchResult[];
    total: number;
  };
  query: string;
}

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        const data: SearchResponse = await response.json();
        
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
    debouncedSearch(searchQuery);
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent-searches', JSON.stringify(newRecent));

    // Navigate to result
    if (result.type === 'prompt') {
      router.push(`/prompts/${result.id}`);
    } else {
      router.push(`/users/${result.id}`);
    }
    
    setIsOpen(false);
    setQuery('');
  };

  const handleRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
    debouncedSearch(recentQuery);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search prompts, templates, community..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 w-full md:w-80 min-h-[44px]"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" data-testid="loading-spinner" />
        )}
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {!query && recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Clock className="w-4 h-4" />
                  Recent searches
                </div>
                {recentSearches.map((recent, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left mb-1"
                    onClick={() => handleRecentSearch(recent)}
                  >
                    {recent}
                  </Button>
                ))}
              </div>
            )}

            {results && (
              <div className="p-2">
                {results.prompts.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Prompts ({results.prompts.length})
                    </div>
                    {results.prompts.map((prompt) => (
                      <Button
                        key={prompt.id}
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto min-h-[44px]"
                        onClick={() => handleResultClick(prompt)}
                      >
                        <FileText className="w-4 h-4 mr-3 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium">{prompt.title}</div>
                          {prompt.description && (
                            <div className="text-sm text-gray-500 truncate">
                              {prompt.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {prompt._count?.likes} likes • {prompt._count?.uses} uses
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {results.users.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Users ({results.users.length})
                    </div>
                    {results.users.map((user) => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto min-h-[44px]"
                        onClick={() => handleResultClick(user)}
                      >
                        <User className="w-4 h-4 mr-3 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-400">
                            {user._count?.prompts} prompts • {user._count?.followers} followers
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {results.total === 0 && query && (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
