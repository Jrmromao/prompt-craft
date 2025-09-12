import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';
import { SupportTicket, Message, User, TicketStatus, Priority, Category } from '@prisma/client';

interface TicketWithDetails extends SupportTicket {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  messages: Array<Message & {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export class SupportTicketService {
  private static instance: SupportTicketService;

  private constructor() {}

  public static getInstance(): SupportTicketService {
    if (!SupportTicketService.instance) {
      SupportTicketService.instance = new SupportTicketService();
    }
    return SupportTicketService.instance;
  }

  async getTicket(ticketId: string): Promise<TicketWithDetails | null> {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      return ticket;
    } catch (error) {
      throw new ServiceError('Failed to get support ticket', 'TICKET_NOT_FOUND', 404);
    }
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      return await prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new ServiceError('Failed to get user tickets', 'USER_TICKETS_FETCH_FAILED', 500);
    }
  }

  async createTicket(data: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    userId: string;
  }): Promise<SupportTicket> {
    try {
      return await prisma.supportTicket.create({
        data,
      });
    } catch (error) {
      throw new ServiceError('Failed to create support ticket', 'TICKET_CREATE_FAILED', 500);
    }
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    try {
      return await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status },
      });
    } catch (error) {
      throw new ServiceError('Failed to update ticket status', 'TICKET_UPDATE_FAILED', 500);
    }
  }

  async addMessage(data: {
    content: string;
    ticketId: string;
    userId: string;
    isSystemMessage?: boolean;
  }): Promise<Message> {
    try {
      return await prisma.message.create({
        data,
      });
    } catch (error) {
      throw new ServiceError('Failed to add message', 'MESSAGE_CREATE_FAILED', 500);
    }
  }
}
