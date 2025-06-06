'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, MessageCircle, ChevronDown, ChevronUp, X, Trash2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  _count?: {
    likes: number;
  };
  liked?: boolean;
}

interface CommentLiteProps {
  id: string;
  onCountChange?: (count: number) => void;
}

export function CommentLite({ id, onCountChange }: CommentLiteProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [likedComments, setLikedComments] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const fetchComments = async (pageNum: number = 1) => {
    try {
      const response = await fetch(
        `/api/prompts/${id}/comments?page=${pageNum}&limit=${COMMENTS_PER_PAGE}`
      );
      if (response.ok) {
        const data = await response.json();
        const commentsWithLikes = data.comments.map((comment: Comment) => ({
          ...comment,
          liked: comment.liked || false,
        }));

        if (pageNum === 1) {
          setComments(commentsWithLikes);
          // Initialize like states
          const likeStates = commentsWithLikes.reduce(
            (acc: { [key: string]: boolean }, comment: Comment) => {
              acc[comment.id] = comment.liked || false;
              return acc;
            },
            {}
          );
          setLikedComments(likeStates);

          // Initialize like counts
          const counts = commentsWithLikes.reduce(
            (acc: { [key: string]: number }, comment: Comment) => {
              acc[comment.id] = comment._count?.likes || 0;
              return acc;
            },
            {}
          );
          setLikeCounts(counts);
        } else {
          setComments(prev => [...prev, ...commentsWithLikes]);
          // Update like states for new comments
          const newLikeStates = commentsWithLikes.reduce(
            (acc: { [key: string]: boolean }, comment: Comment) => {
              acc[comment.id] = comment.liked || false;
              return acc;
            },
            {}
          );
          setLikedComments(prev => ({ ...prev, ...newLikeStates }));

          // Update like counts for new comments
          const newCounts = commentsWithLikes.reduce(
            (acc: { [key: string]: number }, comment: Comment) => {
              acc[comment.id] = comment._count?.likes || 0;
              return acc;
            },
            {}
          );
          setLikeCounts(prev => ({ ...prev, ...newCounts }));
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
    const interval = setInterval(() => {
      fetchComments();
    }, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(totalComments);
    }
  }, [totalComments, onCountChange]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchComments(nextPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      content: newComment,
      createdAt: new Date().toISOString(),
      user: {
        name: 'You',
        imageUrl: null,
      },
    };

    setComments(prev => [tempComment, ...prev]);
    setNewComment('');
    setTotalComments(prev => prev + 1);

    try {
      const response = await fetch(`/api/prompts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleLike = async (commentId: string) => {
    // Optimistically update UI
    const wasLiked = likedComments[commentId];
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !wasLiked,
    }));
    setLikeCounts(prev => ({
      ...prev,
      [commentId]: wasLiked ? prev[commentId] - 1 : prev[commentId] + 1,
    }));

    try {
      const response = await fetch(`/api/prompts/${id}/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      // Update with actual server state
      setLikeCounts(prev => ({
        ...prev,
        [commentId]: data.likeCount,
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to toggle like');
      // Revert optimistic update on error
      setLikedComments(prev => ({
        ...prev,
        [commentId]: wasLiked,
      }));
      setLikeCounts(prev => ({
        ...prev,
        [commentId]: wasLiked ? prev[commentId] + 1 : prev[commentId] - 1,
      }));
    }
  };

  const deleteComment = async (commentId: string) => {
    const prevComments = comments;
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    setTotalComments(prev => prev - 1);

    try {
      const response = await fetch(`/api/prompts/${id}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
      setComments(prevComments); // Restore previous state
      setTotalComments(prev => prev + 1);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const handleDeleteConfirm = () => {
    if (commentToDelete) {
      deleteComment(commentToDelete);
      setCommentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setCommentToDelete(null);
  };

  const renderComment = (comment: Comment) => {
    return (
      <div key={comment.id} className="relative w-full min-w-0 max-w-xl overflow-x-auto">
        <div className="flex min-w-0 gap-3">
          <div className="relative z-10">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.imageUrl || undefined} />
              <AvatarFallback>{comment.user.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{comment.user.name || 'Anonymous'}</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="break-words text-sm text-gray-900 dark:text-gray-100">
              {comment.content}
            </p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-2 text-xs transition-colors ${likedComments[comment.id] ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500 dark:text-gray-400'}`}
                title="Like"
              >
                <Heart
                  className={`h-3 w-3 ${likedComments[comment.id] ? 'fill-pink-500' : 'fill-none'}`}
                />
                <span className="min-w-[1.5rem] text-right">{likeCounts[comment.id] || 0}</span>
                <span>Like</span>
              </button>
              <button
                onClick={() => handleDeleteClick(comment.id)}
                className="flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-700"
                title="Delete comment"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Comments ({totalComments})
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
              maxLength={MAX_CHARACTERS}
            />
            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${newComment.length > MAX_CHARACTERS * 0.8 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {newComment.length}/{MAX_CHARACTERS}
              </span>
              <Button
                type="submit"
                disabled={!newComment.trim() || newComment.length > MAX_CHARACTERS}
                size="sm"
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map(comment => renderComment(comment))}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              onClick={loadMore}
              disabled={isLoadingMore}
              size="sm"
              className="text-xs"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
