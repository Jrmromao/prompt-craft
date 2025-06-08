'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

interface VoteButtonProps {
  id: string;
  initialUpvotes: number;
  onVoteChange?: (upvotes: number) => void;
}

export function VoteButton({ id, initialUpvotes, onVoteChange }: VoteButtonProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserVote();
      const interval = setInterval(fetchUserVote, 10000); // every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isLoaded, user, id]);

  const fetchUserVote = async () => {
    if (!user) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/prompts/${id}/vote`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (response.ok) {
        const data = await response.json();
        setUserVote(data.vote);
      } else {
        const error = await response.json();
        console.error('Error fetching user vote:', error);
        if (!error.error?.includes('Invalid origin')) {
          toast.error('Failed to fetch vote status');
        }
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
      if (!(error instanceof Error && error.message.includes('Failed to fetch'))) {
        toast.error('Failed to fetch vote status');
      }
    }
  };

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousVote = userVote;
    const previousUpvotes = upvotes;

    // Calculate new upvotes based on previous state
    let newUpvotes = upvotes;
    if (previousVote === value) {
      // If clicking the same vote, remove it
      newUpvotes -= value;
      setUserVote(null);
    } else if (previousVote) {
      // If changing vote, update it
      newUpvotes += value * 2; // Multiply by 2 because we're changing from -1 to 1 or vice versa
      setUserVote(value);
    } else {
      // If new vote
      newUpvotes += value;
      setUserVote(value);
    }

    setUpvotes(newUpvotes);
    onVoteChange?.(newUpvotes);

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/prompts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to vote');
      }

      const data = await response.json();
      // Update with server response
      setUpvotes(data.upvotes);
      onVoteChange?.(data.upvotes);
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setUpvotes(previousUpvotes);
      setUserVote(previousVote);
      onVoteChange?.(previousUpvotes);
      toast.error(error instanceof Error ? error.message : 'Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={`rounded-full p-2 transition-colors ${
          userVote === 1
            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Upvote"
      >
        <ThumbsUp className="h-5 w-5" />
      </button>
      <span className="font-medium">{upvotes}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={`rounded-full p-2 transition-colors ${
          userVote === -1
            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Downvote"
      >
        <ThumbsDown className="h-5 w-5" />
      </button>
    </div>
  );
}
