import { prisma } from '@/lib/prisma';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export class CommentService {
  private static instance: CommentService;

  private constructor() {}

  public static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  async createComment(promptId: string, clerkUserId: string, content: string, parentId?: string) {
    try {
      // Get or create the user from the Clerk user ID
      let user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });

      if (!user) {
        // Get user data from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (!email) {
          throw new Error('User email not found');
        }

        // Create the user if they don't exist
        user = await prisma.user.create({
          data: {
            clerkId: clerkUserId,
            email,
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
            imageUrl: clerkUser.imageUrl,
          },
          select: { id: true },
        });
      }

      // Verify the prompt exists
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
      });

      if (!prompt) {
        throw new Error('Prompt not found');
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
    } catch (error) {
      console.error('Error creating comment:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create comment: ${error.message}`);
      }
      throw new Error('Failed to create comment');
    }
  }

  async getComments(promptId: string, page: number, limit: number, orderBy: string, order: 'asc' | 'desc') {
    try {
      const skip = (page - 1) * limit;

      // Verify the prompt exists
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
      });

      if (!prompt) {
        throw new Error('Prompt not found');
      }

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: {
            promptId,
            parentId: null, // Only get top-level comments
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
          orderBy: {
            [orderBy]: order,
          },
          skip,
          take: limit,
        }),
        prisma.comment.count({
          where: {
            promptId,
            parentId: null,
          },
        }),
      ]);

      return {
        comments: comments.map(comment => ({
          ...comment,
          liked: false,
        })),
        total,
        hasMore: skip + comments.length < total,
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }
      throw new Error('Failed to fetch comments');
    }
  }

  async toggleLike(commentId: string, userId: string) {
    // Get the comment to get its promptId
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { promptId: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const like = await prisma.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (like) {
      await prisma.commentLike.delete({
        where: {
          id: like.id,
        },
      });
      return false;
    } else {
      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
          promptId: comment.promptId,
        },
      });
      return true;
    }
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
      },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
