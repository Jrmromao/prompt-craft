import { prisma } from "@/lib/prisma";

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
        reports: {
          some: {},
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        reports: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        reports: {
          _count: "desc",
        },
      },
    }),
    prisma.comment.findMany({
      where: {
        reports: {
          some: {},
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        reports: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        reports: {
          _count: "desc",
        },
      },
    }),
  ]);

  return {
    reportedPrompts: reportedPrompts.map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
      author: {
        name: prompt.user.name,
        email: prompt.user.email,
      },
      reportCount: prompt.reports.length,
      lastReportedAt: prompt.reports[0]?.createdAt || new Date(),
      reports: prompt.reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt,
        user: {
          name: report.user.name,
          email: report.user.email,
        },
      })),
    })),
    reportedComments: reportedComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: {
        name: comment.user.name,
        email: comment.user.email,
      },
      reportCount: comment.reports.length,
      lastReportedAt: comment.reports[0]?.createdAt || new Date(),
      reports: comment.reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt,
        user: {
          name: report.user.name,
          email: report.user.email,
        },
      })),
    })),
  };
}

export async function bulkModerateContent(
  contentIds: string[],
  contentType: "prompt" | "comment",
  action: "approve" | "reject" | "delete",
  reason: string
) {
  if (contentType === "prompt") {
    if (action === "delete") {
      await prisma.prompt.deleteMany({
        where: { id: { in: contentIds } },
      });
    } else if (action === "reject") {
      await prisma.prompt.updateMany({
        where: { id: { in: contentIds } },
        data: { isPublic: false },
      });
    }
  } else {
    if (action === "delete") {
      await prisma.comment.deleteMany({
        where: { id: { in: contentIds } },
      });
    } else if (action === "reject") {
      await prisma.comment.updateMany({
        where: { id: { in: contentIds } },
        data: { hidden: true },
      });
    }
  }

  // Create audit log entries for each item
  await Promise.all(
    contentIds.map((contentId) =>
      prisma.auditLog.create({
        data: {
          action: `BULK_MODERATE_${action.toUpperCase()}`,
          resource: contentType.toUpperCase(),
          status: "SUCCESS",
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