import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

interface CommentsProps {
  promptId: string;
}

export function Comments({ promptId }: CommentsProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [promptId, page]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/prompts/${promptId}/comments?page=${page}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setComments(data.comments);
        } else {
          setComments((prev) => [...prev, ...data.comments]);
        }
        setHasMore(data.comments.length === 10);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={comment.user.imageUrl || undefined} />
              <AvatarFallback>
                {comment.user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {comment.user.name || 'Anonymous'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}

        {hasMore && (
          <Button
            variant="outline"
            onClick={loadMore}
            className="w-full"
          >
            Load More Comments
          </Button>
        )}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
} 