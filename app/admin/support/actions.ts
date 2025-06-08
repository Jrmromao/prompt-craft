'use server';

import { auth } from '@clerk/nextjs/server';
import { SupportService } from '@/lib/services/supportService';
import { revalidatePath } from 'next/cache';
import { TicketStatus, Category, Priority } from '@prisma/client';

interface GetTicketsFilters {
  status?: TicketStatus;
  category?: Category;
  priority?: Priority;
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
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

export async function getTickets(filters: GetTicketsFilters = {}) {
  try {
    const session = await auth();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }

    const supportService = SupportService.getInstance();
    const tickets = await supportService.getTickets(session.userId, filters);

    return tickets.map((ticket: Ticket) => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      messages: ticket.messages.map(message => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
}

export async function addTicketComment(ticketId: string, content: string) {
  try {
    const session = await auth();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }

    const supportService = SupportService.getInstance();
    const message = await supportService.addMessage(ticketId, session.userId, content);

    revalidatePath('/admin/support');
    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  try {
    const session = await auth();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }

    const supportService = SupportService.getInstance();
    const ticket = await supportService.updateTicketStatus(ticketId, status, session.userId);

    revalidatePath('/admin/support');
    return {
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      messages: ticket.messages.map(message => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
}

export async function requestTicketResponse(ticketId: string) {
  try {
    const session = await auth();
    if (!session.userId) {
      throw new Error('Unauthorized');
    }

    const supportService = SupportService.getInstance();
    const ticket = await supportService.requestTicketResponse(ticketId, session.userId);

    revalidatePath('/admin/support');
    return {
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      messages: ticket.messages.map(message => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error requesting ticket response:', error);
    throw error;
  }
}

export async function createTicket(data: {
  title: string;
  description: string;
  category: Category;
  priority?: Priority;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('Authentication required');
    }

    const supportService = SupportService.getInstance();
    const ticket = await supportService.createTicket(clerkId, data);

    revalidatePath('/admin/support');
    return ticket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

export async function addMessage(ticketId: string, content: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('Authentication required');
    }

    const supportService = SupportService.getInstance();
    const message = await supportService.addMessage(ticketId, clerkId, content);

    revalidatePath('/admin/support');
    return message;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}
