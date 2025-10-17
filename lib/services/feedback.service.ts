import { prisma } from '@/lib/prisma';
import { FeedbackType, FeedbackCategory, FeedbackStatus, FeedbackPriority } from '@prisma/client';

export interface CreateFeedbackData {
  userId?: string;
  email?: string;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  message: string;
  rating?: number;
  url?: string;
  userAgent?: string;
  metadata?: any;
}

export interface UpdateFeedbackData {
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  assignedTo?: string;
  response?: string;
}

export class FeedbackService {
  private static instance: FeedbackService;

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  async createFeedback(data: CreateFeedbackData) {
    return await prisma.feedback.create({
      data,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getFeedback(id: string) {
    return await prisma.feedback.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getAllFeedback(filters?: {
    type?: FeedbackType;
    status?: FeedbackStatus;
    priority?: FeedbackPriority;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { type, status, priority, userId, limit = 50, offset = 0 } = filters || {};

    return await prisma.feedback.findMany({
      where: {
        ...(type && { type }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(userId && { userId }),
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async updateFeedback(id: string, data: UpdateFeedbackData) {
    return await prisma.feedback.update({
      where: { id },
      data: {
        ...data,
        responseAt: data.response ? new Date() : undefined,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteFeedback(id: string) {
    return await prisma.feedback.delete({
      where: { id },
    });
  }

  async getFeedbackStats() {
    const [total, byStatus, byType, byPriority] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.feedback.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.feedback.groupBy({
        by: ['priority'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
