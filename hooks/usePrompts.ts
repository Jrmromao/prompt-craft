'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Prompt {
  id: string;
  name: string;
  description: string | null;
  content: string;
  isPublic: boolean;
  promptType: string;
  metadata: any | null;
  tags: { id: string; name: string }[];
  createdAt: Date;
  userId: string;
}

interface UsePromptsOptions {
  includePublic?: boolean;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export function usePrompts(options: UsePromptsOptions = {}) {
  const { userId } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchPrompts = useCallback(async () => {
    if (!userId) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...(options.includePublic && { includePublic: 'true' }),
        ...(options.tags?.length && { tags: options.tags.join(',') }),
        ...(options.search && { search: options.search }),
        ...(options.page && { page: options.page.toString() }),
        ...(options.limit && { limit: options.limit.toString() }),
      });

      const response = await fetch(`/api/prompts?${queryParams}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignore abort errors
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId, options.includePublic, options.tags, options.search, options.page, options.limit]);

  const debouncedFetch = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchPrompts();
    }, 300); // 300ms debounce
  }, [fetchPrompts]);

  useEffect(() => {
    debouncedFetch();

    return () => {
      // Cleanup
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetch]);

  const savePrompt = useCallback(
    async (data: {
      name: string;
      description?: string;
      content: string;
      isPublic: boolean;
      promptType?: string;
      metadata?: any;
      tags: string[];
    }) => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to save prompt');
        }

        await fetchPrompts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fetchPrompts]
  );

  const updatePrompt = useCallback(
    async (id: string, data: Partial<Prompt>) => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/prompts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update prompt');
        }

        await fetchPrompts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fetchPrompts]
  );

  const deletePrompt = useCallback(
    async (id: string) => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/prompts/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete prompt');
        }

        await fetchPrompts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fetchPrompts]
  );

  return {
    prompts,
    total,
    isLoading,
    error,
    savePrompt,
    updatePrompt,
    deletePrompt,
    refresh: fetchPrompts,
  };
}
