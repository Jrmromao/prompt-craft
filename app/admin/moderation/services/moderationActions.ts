import { prisma } from '@/lib/prisma';

export type ModerationAction = 'approve' | 'reject' | 'delete';

interface ModerateContentParams {
  contentId: string;
  contentType: 'prompt' | 'comment';
  action: ModerationAction;
  reason: string;
}

export async function moderateContent({
  contentId,
  contentType,
  action,
  reason,
}: ModerateContentParams) {
  if (contentType === 'prompt') {
    if (action === 'delete') {
      await prisma.prompt.delete({
        where: { id: contentId },
      });
    } else if (action === 'reject') {
      await prisma.prompt.update({
        where: { id: contentId },
        data: { isPublic: false },
      });
    }
  } else {
    if (action === 'delete') {
      await prisma.comment.delete({
        where: { id: contentId },
      });
    } else if (action === 'reject') {
      await prisma.comment.update({
        where: { id: contentId },
        data: { hidden: true },
      });
    }
  }

  // Create an audit log entry
  await prisma.auditLog.create({
    data: {
      action: `MODERATE_${action.toUpperCase()}`,
      resource: contentType.toUpperCase(),
      status: 'SUCCESS',
      details: {
        reason,
        action,
        contentId,
        contentType,
      },
    },
  });
}

export async function bulkModerateContent(
  contentIds: string[],
  contentType: 'prompt' | 'comment',
  action: ModerationAction,
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
