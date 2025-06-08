'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useUser, useAuth } from '@clerk/nextjs';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    imageUrl: string | null;
  };
  _count?: {
    likes: number;
  };
  liked?: boolean;
}

const COMMENTS_PER_PAGE = 10;
const MAX_CHARACTERS = 1000;

interface BasicCommentsProps {
  promptId: string;
  initialComments?: Comment[];
  onCommentCountChange?: (count: number) => void;
  onCountChange?: (count: number) => void;
}

export function BasicComments({ promptId, initialComments = [], onCommentCountChange, onCountChange }: BasicCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(initialComments.length);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/prompts/${promptId}/comments?page=${page}&limit=${COMMENTS_PER_PAGE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
      setTotalComments(data.totalComments || data.total || 0);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch comments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [promptId, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      toast({
        title: 'Error',
        description: 'Please wait while we load your account information',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to comment',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post comment');
      }

      const newCommentData = await response.json();
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      setTotalComments(prev => prev + 1);
      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(totalComments);
    }
    if (onCountChange) {
      onCountChange(totalComments);
    }
  }, [totalComments, onCommentCountChange, onCountChange]);

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Write a comment..." : "Please sign in to comment"}
          className="min-h-[100px]"
          disabled={isSubmitting || !user}
          maxLength={MAX_CHARACTERS}
        />
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={fetchComments}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Comments'}
          </Button>
          <Button type="submit" disabled={!newComment.trim() || isSubmitting || !user}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-background rounded-lg border animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-background rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {comment.user.imageUrl && (
                    <img
                      src={comment.user.imageUrl}
                      alt={comment.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{comment.user.name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-2">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
