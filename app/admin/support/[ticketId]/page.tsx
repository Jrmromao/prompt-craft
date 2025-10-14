'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTickets, addTicketComment, updateTicketStatus } from '../actions';
import { Ticket, Message } from '../types';
import { TicketStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function TicketDetailsPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<TicketStatus | ''>('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const tickets = await getTickets();
        const foundTicket = tickets.find(t => t.id === ticketId);
        if (foundTicket) {
          const ticketWithDates = {
            ...foundTicket,
            createdAt: new Date(foundTicket.createdAt),
            updatedAt: new Date(foundTicket.updatedAt),
            messages: foundTicket.messages.map((message: any) => ({
              ...message,
              createdAt: new Date(message.createdAt),
            })),
          };
          setTicket(ticketWithDates);
          setStatus(ticketWithDates.status);
        } else {
          setTicket(null);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!comment.trim() || !ticket) return;
    try {
      setIsSubmitting(true);
      await addTicketComment(ticket.id, comment);
      setComment('');
      toast.success('Comment added successfully');
      // Refresh ticket
      const tickets = await getTickets();
      const foundTicket = tickets.find(t => t.id === ticketId);
      if (foundTicket) {
        const ticketWithDates = {
          ...foundTicket,
          createdAt: new Date(foundTicket.createdAt),
          updatedAt: new Date(foundTicket.updatedAt),
          messages: foundTicket.messages.map((message: any) => ({
            ...message,
            createdAt: new Date(message.createdAt),
          })),
        };
        setTicket(ticketWithDates);
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      setIsSubmitting(true);
      await updateTicketStatus(ticket.id, newStatus);
      setStatus(newStatus);
      toast.success('Ticket status updated successfully');
      // Refresh ticket
      const tickets = await getTickets();
      const foundTicket = tickets.find(t => t.id === ticketId);
      if (foundTicket) {
        const ticketWithDates = {
          ...foundTicket,
          createdAt: new Date(foundTicket.createdAt),
          updatedAt: new Date(foundTicket.updatedAt),
          messages: foundTicket.messages.map((message: any) => ({
            ...message,
            createdAt: new Date(message.createdAt),
          })),
        };
        setTicket(ticketWithDates);
      }
    } catch (error) {
      toast.error('Failed to update ticket status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!ticket) return <div>Ticket not found</div>;

  const statusColors = {
    OPEN: 'bg-green-500',
    IN_PROGRESS: 'bg-blue-500',
    RESOLVED: 'bg-blue-500',
    CLOSED: 'bg-gray-500',
  };

  const priorityColors = {
    LOW: 'bg-gray-500',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Ticket #{ticket.id}</h1>
          <div className="flex gap-2">
            <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
            <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{ticket.title}</CardTitle>
            <div className="text-sm text-gray-500">Created {ticket.createdAt.toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.createdAt.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.updatedAt.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Select
                    value={status}
                    onValueChange={value => handleStatusChange(value as TicketStatus)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.messages.length === 0 && (
                <div className="text-gray-500">No messages yet.</div>
              )}
              {ticket.messages.map((message: Message) => (
                <div key={message.id} className="rounded border p-3">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">{message.content}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {message.user.name} &middot; {message.createdAt.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAddComment();
              }}
              className="mt-6 space-y-2"
            >
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a message..."
                rows={3}
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
