'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTicket, addTicketComment } from '../actions';
import { Ticket, Message, TicketPriority } from '../types';
import { TicketStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function TicketDetailsPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const foundTicket = await getTicket(ticketId as string);
        if (foundTicket) {
          const ticketWithDates = {
            ...foundTicket,
            createdAt: new Date(foundTicket.createdAt),
            updatedAt: new Date(foundTicket.updatedAt),
            messages:
              foundTicket.messages?.map((message: any) => ({
                ...message,
                createdAt: new Date(message.createdAt),
              })) || [],
          };
          setTicket(ticketWithDates);
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

  useEffect(() => {
    // Auto-scroll to the latest message
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages?.length]);

  const handleAddComment = async () => {
    if (!comment.trim() || !ticket) return;
    try {
      setIsSubmitting(true);
      await addTicketComment(ticket.id, comment);
      setComment('');
      toast.success('Message sent!');
      // Refresh ticket
      const foundTicket = await getTicket(ticketId as string);
      if (foundTicket) {
        const ticketWithDates = {
          ...foundTicket,
          createdAt: new Date(foundTicket.createdAt),
          updatedAt: new Date(foundTicket.updatedAt),
          messages:
            foundTicket.messages?.map((message: any) => ({
              ...message,
              createdAt: new Date(message.createdAt),
            })) || [],
        };
        setTicket(ticketWithDates);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!ticket) return <div>Ticket not found</div>;

  const statusColors: Record<TicketStatus, string> = {
    OPEN: 'bg-green-500',
    IN_PROGRESS: 'bg-blue-500',
    RESOLVED: 'bg-blue-500',
    CLOSED: 'bg-gray-500',
  };

  const priorityColors: Record<TicketPriority, string> = {
    LOW: 'bg-gray-500',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Ticket #{ticket.id.slice(0, 8)}</h1>
          <div className="flex gap-2">
            <Badge className={statusColors[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
            <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
          </div>
        </div>

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
            </dl>
          </CardContent>
        </Card>

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
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border bg-gray-50 p-4">
              {ticket.messages.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No messages yet. Start the conversation below!
                </div>
              )}
              {ticket.messages.map((message: Message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {message.user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="rounded-lg border bg-white px-4 py-2 shadow-sm">
                      <div className="text-sm font-medium text-gray-900">
                        {message.user.name || 'User'}
                      </div>
                      <div className="mb-1 text-xs text-gray-400">
                        {message.createdAt.toLocaleString()}
                      </div>
                      <div className="whitespace-pre-wrap text-gray-800">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
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
                className="bg-white"
              />
              <Button type="submit" disabled={isSubmitting || !comment.trim()} className="w-full">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
