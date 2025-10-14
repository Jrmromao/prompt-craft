import { prisma } from '@/lib/prisma';

export interface ReportedPrompt {
  id: string;
  name: string;
  author: {
    name: string | null;
    email: string;
  };
  reportCount: number;
  lastReportedAt: Date;
  reports: {
    id: string;
    reason: string;
    createdAt: Date;
    user: {
      name: string | null;
      email: string;
    };
  }[];
}

export interface ReportedComment {
  id: string;
  content: string;
  author: {
    name: string | null;
    email: string;
  };
  reportCount: number;
  lastReportedAt: Date;
  reports: {
    id: string;
    reason: string;
    createdAt: Date;
    user: {
      name: string | null;
      email: string;
    };
  }[];
}

export async function getReportedContent() {
  const [reportedPrompts, reportedComments] = await Promise.all([
    prisma.prompt.findMany({
      where: {
        Report: {
          some: {},
        },
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
        Report: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        Report: {
          _count: 'desc',
        },
      },
    }),
    prisma.comment.findMany({
      where: {
        Report: {
          some: {},
        },
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
        Report: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        Report: {
          _count: 'desc',
        },
      },
    }),
  ]);

  return {
    reportedPrompts: reportedPrompts.map(prompt => ({
      id: prompt.id,
      name: prompt.name,
      author: {
        name: prompt.User.name,
        email: prompt.User.email,
      },
      reportCount: prompt.Report.length,
      lastReportedAt: prompt.Report[0]?.createdAt || new Date(),
      reports: prompt.Report.map(report => ({
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt,
        user: {
          name: report.User.name,
          email: report.User.email,
        },
      })),
    })),
    reportedComments: reportedComments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: {
        name: comment.User.name,
        email: comment.User.email,
      },
      reportCount: comment.Report.length,
      lastReportedAt: comment.Report[0]?.createdAt || new Date(),
      reports: comment.Report.map(report => ({
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt,
        user: {
          name: report.User.name,
          email: report.User.email,
        },
      })),
    })),
  };
}

export async function bulkModerateContent(
  contentIds: string[],
  contentType: 'prompt' | 'comment',
  action: 'approve' | 'reject' | 'delete',
  reason: string
) {
  if (contentType === 'prompt') {
    if (action === 'delete') {
      await prisma.prompt.deleteMany({
        where: { id: { in: contentIds } },
      });
    } else if (action === 'reject') {
      await prisma.prompt.updateMany({
        where: { id: { in: contentIds } },
        data: { isPublic: false },
      });
    }
  } else {
    if (action === 'delete') {
      await prisma.comment.deleteMany({
        where: { id: { in: contentIds } },
      });
    } else if (action === 'reject') {
      await prisma.comment.updateMany({
        where: { id: { in: contentIds } },
        data: { hidden: true },
      });
    }
  }

  // Create audit log entries for each item
  await Promise.all(
    contentIds.map(contentId =>
      prisma.auditLog.create({
        data: {
          action: `BULK_MODERATE_${action.toUpperCase()}`,
          resource: contentType.toUpperCase(),
          status: 'SUCCESS',
          details: {
            reason,
            action,
            contentId,
            contentType,
          },
        },
      })
    )
  );
}

export async function getModeratedWords() {
  const moderatedWords = await prisma.moderation.findMany({
    where: {
      contentType: 'word',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return moderatedWords;
}

export async function createModeratedWord(
  word: string,
  severity: string,
  category: string,
  status: string
) {
  const moderatedWord = await prisma.moderation.create({
    data: {
      contentId: word,
      contentType: 'word',
      severity,
      category,
      status,
    },
  });

  return moderatedWord;
}

export async function removeModeratedWord(id: string) {
  await prisma.moderation.delete({
    where: {
      id,
    },
  });
}
