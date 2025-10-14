'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, User, Calendar, AlertCircle, FileText, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketStatus, Category, Priority } from '@prisma/client';
import { addTicketComment, updateTicketStatus, requestTicketResponse } from '../actions';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

interface ViewTicketDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<TicketStatus, { bg: string; text: string }> = {
  OPEN: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  IN_PROGRESS: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  RESOLVED: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
  },
  CLOSED: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

const priorityColors: Record<Priority, { bg: string; text: string }> = {
  LOW: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
  },
  MEDIUM: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  HIGH: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
  },
  URGENT: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
  },
};

const categoryColors: Record<Category, { bg: string; text: string }> = {
  BUG: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
  },
  FEATURE_REQUEST: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  GENERAL_INQUIRY: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  TECHNICAL_SUPPORT: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
  },
  BILLING: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
};

export function ViewTicketDialog({ ticket, open, onOpenChange }: ViewTicketDialogProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ticket) return null;

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      await addTicketComment(ticket.id, comment);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      setIsSubmitting(true);
      await updateTicketStatus(ticket.id, newStatus);
      toast.success('Ticket status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update ticket status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResponse = async () => {
    try {
      setIsSubmitting(true);
      await requestTicketResponse(ticket.id);
      toast.success('Response requested successfully');
    } catch (error) {
      console.error('Error requesting response:', error);
      toast.error('Failed to request response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextStatus = (currentStatus: TicketStatus): TicketStatus[] => {
    switch (currentStatus) {
      case 'OPEN':
        return ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      case 'IN_PROGRESS':
        return ['RESOLVED', 'CLOSED'];
      case 'RESOLVED':
        return ['CLOSED', 'IN_PROGRESS'];
      case 'CLOSED':
        return ['OPEN', 'IN_PROGRESS'];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{ticket.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Ticket Info */}
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <Select
                value={ticket.status}
                onValueChange={(value: TicketStatus) => handleStatusChange(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    <Badge
                      variant="outline"
                      className={`${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}
                    >
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getNextStatus(ticket.status).map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge
                variant="outline"
                className={`${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}
              >
                {ticket.priority}
              </Badge>
              <Badge
                variant="outline"
                className={`${categoryColors[ticket.category].bg} ${categoryColors[ticket.category].text}`}
              >
                {ticket.category.replace('_', ' ')}
              </Badge>
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Created by {ticket.user.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Last updated{' '}
                  {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-semibold">Messages ({ticket.messages.length})</h3>
              </div>
              {ticket.status === 'IN_PROGRESS' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestResponse}
                  disabled={isSubmitting}
                >
                  Request Response
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {ticket.messages.map(message => (
                  <div key={message.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.user.name || 'Unknown'}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{message.content}</p>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Comment Form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment} disabled={!comment.trim() || isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
