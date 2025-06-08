'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, MessageCircle, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser, useAuth } from '@clerk/nextjs';

const COMMENTS_PER_PAGE = 10;
const MAX_CHARACTERS = 280;

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    imageUrl: string | null;
  };
}

interface RichCommentsProps {
  id: string;
}

export function RichComments({ id }: RichCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const fetchComments = async (pageNum: number = 1) => {
    try {
      const response = await fetch(
        `/api/prompts/${id}/comments?page=${pageNum}&limit=${COMMENTS_PER_PAGE}`,
        {
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (pageNum === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setTotalComments(data.total);
        setHasMore(data.comments.length === COMMENTS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchComments();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [id]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchComments(nextPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      toast.error('Please wait while we load your account information');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      content: newComment,
      createdAt: new Date().toISOString(),
      user: {
        name: user.fullName || 'You',
        imageUrl: user.imageUrl,
      },
    };

    setComments(prev => [tempComment, ...prev]);
    setNewComment('');
    setTotalComments(prev => prev + 1);

    try {
      const token = await getToken();
      const response = await fetch(`/api/prompts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      setComments(prev => prev.map(comment => (comment.id === tempId ? data : comment)));
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
      setComments(prev => prev.filter(comment => comment.id !== tempId));
      setNewComment(newComment);
      setTotalComments(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comments ({totalComments})</h3>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.fullName?.[0]?.toUpperCase() || 'Y'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder={user ? "What's happening?" : "Please sign in to comment"}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                maxLength={MAX_CHARACTERS}
                disabled={!user}
              />
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                  <button type="button" className="transition-colors hover:text-blue-500">
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button type="button" className="transition-colors hover:text-green-500">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button type="button" className="transition-colors hover:text-blue-500">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm ${newComment.length > MAX_CHARACTERS * 0.8 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {newComment.length}/{MAX_CHARACTERS}
                  </span>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || newComment.length > MAX_CHARACTERS || !user}
                    className="rounded-full px-4"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {comments.map(comment => (
          <div
            key={comment.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user.imageUrl || undefined} />
                <AvatarFallback>{comment.user.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{comment.user.name || 'Anonymous'}</p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-gray-100">{comment.content}</p>
                <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
                  <button className="flex items-center gap-2 transition-colors hover:text-red-500">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center gap-2 transition-colors hover:text-blue-500">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full rounded-full sm:w-auto"
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
      </div>
    </div>
  );
}
