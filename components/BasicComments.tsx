'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { clientAnalyticsService } from '@/lib/services/clientAnalyticsService';
import { usePromptAnalytics } from './PromptAnalyticsContext';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
const REQUEST_COOLDOWN = 2000; // 2 seconds cooldown between requests

interface BasicCommentsProps {
  promptId: string;
  initialComments?: Comment[];
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
  onCountChange?: (count: number) => void;
}

export function BasicComments({ promptId, initialComments = [], initialCommentCount = 0, onCommentCountChange, onCountChange }: BasicCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(true);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { incrementViewCount, isLoading: analyticsLoading, commentCount, setCommentCount } = usePromptAnalytics();

  // On mount, initialize context value if needed
  useEffect(() => {
    if (typeof commentCount !== 'number') {
      setCommentCount(initialCommentCount);
    }
  }, [commentCount, initialCommentCount, setCommentCount]);

  // Throttled request function
  const makeRequest = useCallback(async (requestFn: () => Promise<any>) => {
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_COOLDOWN) {
      return;
    }
    setLastRequestTime(now);
    return requestFn();
  }, [lastRequestTime]);

  // Track view when component mounts - only once
  useEffect(() => {
    const trackView = async () => {
      try {
        if (!authLoading && isAuthenticated && user && !hasInitialized) {
          await makeRequest(() => incrementViewCount());
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [promptId, authLoading, isAuthenticated, user, incrementViewCount, hasInitialized, makeRequest]);

  const fetchComments = useCallback(async (pageNum: number = 1) => {
    if (isLoading || isLoadingMore) return;

    try {
      setIsLoading(pageNum === 1);
      setIsLoadingMore(pageNum > 1);
      
      await makeRequest(async () => {
        const response = await fetch(`/api/prompts/${promptId}/comments?page=${pageNum}&limit=${COMMENTS_PER_PAGE}`, {
          method: 'GET',
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
          throw new Error(error.error || 'Failed to fetch comments');
        }

        const data = await response.json();
        setComments(prev => pageNum === 1 ? data.comments : [...prev, ...data.comments]);
        setHasMore(data.hasMore);
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch comments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [promptId, isLoading, isLoadingMore, makeRequest, toast]);

  // Initial fetch only once when component mounts, unless initialComments are provided
  useEffect(() => {
    if (!hasInitialized && !isLoading && (!initialComments || initialComments.length === 0)) {
      setHasInitialized(true);
      fetchComments();
    } else if (initialComments && initialComments.length > 0) {
      setHasInitialized(true);
    }
  }, [promptId, hasInitialized, isLoading, fetchComments, initialComments]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchComments(nextPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authLoading) {
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
    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      content: newComment,
      createdAt: new Date().toISOString(),
      user: {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'You',
        imageUrl: user.imageUrl || null,
      },
    };

    // Optimistic update
    setComments(prev => [tempComment, ...prev]);
    setNewComment('');
    setCommentCount(typeof commentCount === 'number' ? commentCount + 1 : 1);

    try {
      await makeRequest(async () => {
        const response = await fetch(`/api/prompts/${promptId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ content: newComment }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please try again in a moment.');
          }
          const error = await response.json();
          throw new Error(error.error || 'Failed to post comment');
        }

        const newCommentData = await response.json();
        setComments(prev => prev.map(comment => comment.id === tempId ? newCommentData : comment));
        toast({
          title: 'Success',
          description: 'Comment posted successfully',
        });
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      // Revert optimistic update on error
      setComments(prev => prev.filter(comment => comment.id !== tempId));
      setNewComment(newComment);
      setCommentCount(typeof commentCount === 'number' && commentCount > 0 ? commentCount - 1 : 0);
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
    if (typeof commentCount === 'number' && onCommentCountChange) {
      onCommentCountChange(commentCount);
    }
    if (typeof commentCount === 'number' && onCountChange) {
      onCountChange(commentCount);
    }
  }, [commentCount, onCommentCountChange, onCountChange]);

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
        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="default"
            size="sm"
            disabled={!newComment.trim() || isSubmitting || !user}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>

      {/* Comments count and list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="text-sm font-medium">
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </div>
          {commentCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCommentsVisible(!isCommentsVisible)}
                    className="h-8 px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="sr-only">{isCommentsVisible ? 'Hide comments' : 'Show comments'}</span>
                    {isCommentsVisible ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCommentsVisible ? 'Hide comments' : 'Show comments'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {isCommentsVisible && (
          <>
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
              <>
                {comments.map((comment) => (
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
                ))}
                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="w-full sm:w-auto"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
