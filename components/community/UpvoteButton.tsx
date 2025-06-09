'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/nextjs';
import { usePromptAnalytics } from '../PromptAnalyticsContext';
import { cn } from '@/lib/utils';

interface UpvoteButtonProps {
  promptId: string;
  initialUpvotes: number;
  initialHasUpvoted: boolean;
  className?: string;
}

const REQUEST_COOLDOWN = 2000; // 2 seconds cooldown between requests

export function UpvoteButton({ promptId, initialUpvotes, initialHasUpvoted, className }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const { user } = useUser();
  const { toast } = useToast();
  const { incrementUpvoteCount } = usePromptAnalytics();

  // Throttled request function
  const makeRequest = useCallback(async (requestFn: () => Promise<any>) => {
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_COOLDOWN) {
      return;
    }
    setLastRequestTime(now);
    return requestFn();
  }, [lastRequestTime]);

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upvote',
        variant: 'destructive',
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const previousUpvotes = upvotes;
    const previousHasUpvoted = hasUpvoted;

    // Optimistic update
    setUpvotes(prev => hasUpvoted ? prev - 1 : prev + 1);
    setHasUpvoted(prev => !prev);

    try {
      await makeRequest(async () => {
        const response = await fetch(`/api/prompts/${promptId}/upvote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please try again in a moment.');
          }
          const error = await response.json();
          throw new Error(error.error || 'Failed to upvote');
        }

        const data = await response.json();
        setUpvotes(data.upvotes);
        setHasUpvoted(data.hasUpvoted);
        incrementUpvoteCount(data.hasUpvoted);
      });
    } catch (error) {
      console.error('Error upvoting:', error);
      // Revert optimistic update on error
      setUpvotes(previousUpvotes);
      setHasUpvoted(previousHasUpvoted);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upvote',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleUpvote}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 hover:bg-transparent',
        hasUpvoted && 'text-blue-500',
        className
      )}
    >
      <ThumbsUp className={cn('h-4 w-4', hasUpvoted && 'fill-current')} />
      <span>{upvotes}</span>
    </Button>
  );
}
