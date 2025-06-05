'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Ticket {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'BUG' | 'FEATURE_REQUEST' | 'GENERAL_INQUIRY' | 'TECHNICAL_SUPPORT' | 'BILLING';
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      imageUrl: string | null;
    };
  }>;
}

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  HIGH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/support/tickets');
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <Link href="/support/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tickets found. Create a new ticket to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}>
              <Card className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status}
                      </Badge>
                      <Badge className={priorityColors[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{ticket.messages.length} messages</span>
                    </div>
                    <span>
                      Updated{' '}
                      {formatDistanceToNow(new Date(ticket.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 