import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface VoteButtonProps {
  promptId: string;
  initialUpvotes: number;
  onVoteChange?: (upvotes: number) => void;
}

export function VoteButton({ promptId, initialUpvotes, onVoteChange }: VoteButtonProps) {
  const { user } = useUser();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserVote();
    }
  }, [user, promptId]);

  const fetchUserVote = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/vote`);
      if (response.ok) {
        const data = await response.json();
        setUserVote(data.vote);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      setUpvotes(data.upvotes);
      setUserVote(userVote === value ? null : value);
      onVoteChange?.(data.upvotes);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors ${
          userVote === 1
            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Upvote"
      >
        <ThumbsUp className="w-5 h-5" />
      </button>
      <span className="font-medium">{upvotes}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors ${
          userVote === -1
            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Downvote"
      >
        <ThumbsDown className="w-5 h-5" />
      </button>
    </div>
  );
} 