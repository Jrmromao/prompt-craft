import { prisma } from '@/lib/prisma';
import { TicketStatus, Category, Priority } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';
import { EmailService } from './emailService';

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

export class SupportService {
  private static instance: SupportService;
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): SupportService {
    if (!SupportService.instance) {
      SupportService.instance = new SupportService();
    }
    return SupportService.instance;
  }

  private async getDbUserId(clerkId: string): Promise<string> {
    // First try to find the user
    let user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    // If user doesn't exist, create them
    if (!user) {
      // Get user data from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkId);

      // Create the user in our database
      user = await prisma.user.create({
        data: {
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
          imageUrl: clerkUser.imageUrl,
        },
        select: { id: true },
      });
    }

    return user.id;
  }

  async createTicket(
    clerkId: string,
    data: {
      title: string;
      description: string;
      category: Category;
      priority?: Priority;
    }
  ) {
    try {
      const dbUserId = await this.getDbUserId(clerkId);

      const ticket = await prisma.supportTicket.create({
        data: {
          ...data,
          userId: dbUserId,
          status: 'OPEN',
          priority: data.priority || 'MEDIUM',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      });

      // Send ticket creation notification
      await this.emailService.sendTicketCreatedNotification(
        ticket.user.email,
        ticket.user.name || 'there',
        ticket.id,
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.priority
      );

      return ticket;
    } catch (error) {
      console.error(
        'SupportService: Error creating ticket:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  async getTickets(
    userId: string,
    filters: {
      status?: TicketStatus;
      category?: Category;
      priority?: Priority;
    } = {}
  ): Promise<Ticket[]> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return [];
    }

    const where = {
      ...(user.role === 'ADMIN' ? {} : { userId: user.id }),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
    };

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return tickets;
  }

  async getTicket(id: string) {
    return prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async canViewTicket(clerkId: string, ticketId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    });

    if (!user) {
      return false;
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });

    return ticket?.userId === user.id;
  }

  async addMessage(ticketId: string, userId: string, content: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.message.create({
      data: {
        content,
        ticketId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    userId: string
  ): Promise<Ticket> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    // Add a system message for status change
    await prisma.message.create({
      data: {
        content: `Ticket status changed to ${status.replace('_', ' ')}.`,
        ticketId,
        userId: user.id,
        isSystemMessage: true,
      },
    });

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return updatedTicket;
  }

  async addAttachment(
    ticketId: string,
    data: {
      filename: string;
      url: string;
      type: string;
      size: number;
    }
  ) {
    return prisma.attachment.create({
      data: {
        ...data,
        ticketId,
      },
    });
  }

  async assignTicket(ticketId: string, assigneeClerkId: string, assignedByClerkId: string) {
    const assigneeDbId = await this.getDbUserId(assigneeClerkId);
    const assignedByDbId = await this.getDbUserId(assignedByClerkId);

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assigneeId: assigneeDbId,
        status: 'IN_PROGRESS',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send assignment notification to both the assignee and the ticket creator
    await Promise.all([
      this.emailService.sendTicketAssignedNotification(
        ticket.assignee?.email || '',
        ticket.assignee?.name || 'there',
        ticket.id,
        ticket.title,
        ticket.user.name || 'the user'
      ),
      this.emailService.sendTicketAssignedToCreatorNotification(
        ticket.user.email,
        ticket.user.name || 'there',
        ticket.id,
        ticket.title,
        ticket.assignee?.name || 'the assignee'
      ),
    ]);

    return ticket;
  }

  async requestTicketResponse(ticketId: string, userId: string): Promise<Ticket> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'IN_PROGRESS') {
      throw new Error('Can only request response for tickets in progress');
    }

    // Add a system message requesting response
    await prisma.message.create({
      data: {
        content: 'Response requested from the user.',
        ticketId,
        userId: user.id,
        isSystemMessage: true,
      },
    });

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return updatedTicket;
  }
}
