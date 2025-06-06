import { prisma } from '@/lib/prisma';

export class CommentService {
  private static instance: CommentService;

  private constructor() {}

  public static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  async toggleLike(commentId: string, clerkUserId: string) {
    // Get the database user ID from the Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the comment exists and get its promptId
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { promptId: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Toggle like: if exists, remove; if not, add
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId,
          },
        },
      });
    } else {
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId,
          promptId: comment.promptId,
        },
      });
    }

    // Get updated like count
    const likeCount = await prisma.commentLike.count({
      where: { commentId },
    });

    return { likeCount };
  }

  async deleteComment(commentId: string, clerkUserId: string) {
    // Get the database user ID from the Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== user.id) {
      throw new Error('Unauthorized to delete this comment');
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async createComment(promptId: string, clerkUserId: string, content: string, parentId?: string) {
    // Get the database user ID from the Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        promptId,
        userId: user.id,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      ...comment,
      liked: false,
    };
  }

  async getComments(
    promptId: string,
    page: number,
    limit: number,
    orderBy: string,
    order: 'asc' | 'desc'
  ) {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { promptId },
        orderBy: { [orderBy]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      }),
      prisma.comment.count({ where: { promptId } }),
    ]);

    // Get like status for current user
    const commentsWithLikes = await Promise.all(
      comments.map(async comment => {
        let liked = false;
        const like = await prisma.commentLike.findFirst({
          where: {
            commentId: comment.id,
          },
        });
        liked = !!like;
        return {
          ...comment,
          liked,
        };
      })
    );

    return {
      comments: commentsWithLikes,
      total,
    };
  }
}
