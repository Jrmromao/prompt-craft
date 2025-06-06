import { prisma } from '@/lib/prisma';
import { Category, Priority, TicketStatus } from '@prisma/client';

export class SupportService {
  private static instance: SupportService;

  private constructor() {}

  public static getInstance(): SupportService {
    if (!SupportService.instance) {
      SupportService.instance = new SupportService();
    }
    return SupportService.instance;
  }

  async createTicket(
    userId: string,
    data: {
      title: string;
      description: string;
      category: Category;
      priority?: Priority;
    }
  ) {
    return prisma.supportTicket.create({
      data: {
        ...data,
        userId,
        status: 'OPEN',
        priority: data.priority || 'MEDIUM',
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

  async getTickets(
    userId: string,
    filters?: {
      status?: TicketStatus;
      category?: Category;
      priority?: Priority;
    }
  ) {
    return prisma.supportTicket.findMany({
      where: {
        userId,
        ...filters,
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
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getTicket(ticketId: string, userId: string) {
    return prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
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
        attachments: true,
      },
    });
  }

  async addMessage(ticketId: string, userId: string, content: string) {
    return prisma.message.create({
      data: {
        content,
        ticketId,
        userId,
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

  async updateTicketStatus(ticketId: string, userId: string, status: TicketStatus) {
    return prisma.supportTicket.update({
      where: {
        id: ticketId,
        userId,
      },
      data: {
        status,
      },
    });
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
}
