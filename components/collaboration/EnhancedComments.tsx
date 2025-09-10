'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Reply, Heart, MoreHorizontal, Flag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    imageUrl?: string
    isAuthor?: boolean
  }
  likes: number
  isLiked: boolean
  replies?: Comment[]
  replyCount: number
  isEdited?: boolean
}

interface EnhancedCommentsProps {
  promptId: string
  initialComments: Comment[]
  onCommentCountChange?: (count: number) => void
}

export function EnhancedComments({ 
  promptId, 
  initialComments, 
  onCommentCountChange 
}: EnhancedCommentsProps) {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (!response.ok) throw new Error('Failed to post comment')

      const newCommentData = await response.json()
      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
      onCommentCountChange?.(comments.length + 1)
      toast.success('Comment posted!')
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          content: replyContent.trim(),
          parentId 
        }),
      })

      if (!response.ok) throw new Error('Failed to post reply')

      const replyData = await response.json()
      
      // Add reply to parent comment
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { 
              ...comment, 
              replies: [replyData, ...(comment.replies || [])],
              replyCount: comment.replyCount + 1
            }
          : comment
      ))
      
      setReplyContent('')
      setReplyingTo(null)
      toast.success('Reply posted!')
    } catch (error) {
      toast.error('Failed to post reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to like comments')
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to like comment')

      const { isLiked, likes } = await response.json()
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, isLiked, likes }
          : {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId ? { ...reply, isLiked, likes } : reply
              )
            }
      ))
    } catch (error) {
      toast.error('Failed to like comment')
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={cn("space-y-3", isReply && "ml-8 border-l-2 border-muted pl-4")}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.imageUrl} />
          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.user.name}</span>
            {comment.user.isAuthor && (
              <Badge variant="secondary" className="text-xs">Author</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
          
          <p className="text-sm leading-relaxed">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className={cn(
                "h-auto p-1 text-xs",
                comment.isLiked && "text-red-600"
              )}
            >
              <Heart className={cn("h-3 w-3 mr-1", comment.isLiked && "fill-current")} />
              {comment.likes}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="h-auto p-1 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {!isReply && comment.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleReplies(comment.id)}
                className="h-auto p-1 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {comment.replyCount} replies
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="space-y-2 pt-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {!isReply && expandedReplies.has(comment.id) && comment.replies && (
        <div className="space-y-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Comment form */}
      {user ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl || undefined} />
              <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Sign in to join the conversation</p>
        </div>
      )}
      
      {/* Comments list */}
      <div className="space-y-6">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
