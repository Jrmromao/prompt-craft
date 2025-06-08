import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CommentService } from './commentService';

export class CommunityService {
  private static instance: CommunityService;

  private constructor() {}

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  // Vote on a prompt
  public async votePrompt(
    userId: string,
    promptId: string,
    value: 1 | -1
  ): Promise<{ upvotes: number }> {
    // Use a transaction to ensure atomicity
    return prisma.$transaction(async tx => {
      // Check if user has already voted
      const existingVote = await tx.vote.findFirst({
        where: {
          userId,
          promptId,
        },
      });

      if (existingVote) {
        // If voting the same way, remove the vote
        if (existingVote.value === value) {
          await tx.vote.delete({
            where: {
              id: existingVote.id,
            },
          });
          // Update prompt upvotes
          const prompt = await tx.prompt.update({
            where: { id: promptId },
            data: {
              upvotes: {
                decrement: value,
              },
            },
          });
          return { upvotes: prompt.upvotes };
        } else {
          // If changing vote, update it
          await tx.vote.update({
            where: {
              id: existingVote.id,
            },
            data: { value },
          });
          // Update prompt upvotes (remove old vote and add new one)
          const prompt = await tx.prompt.update({
            where: { id: promptId },
            data: {
              upvotes: {
                increment: value * 2, // Multiply by 2 because we're changing from -1 to 1 or vice versa
              },
            },
          });
          return { upvotes: prompt.upvotes };
        }
      }

      // Create new vote
      await tx.vote.create({
        data: {
          userId,
          promptId,
          value,
        },
      });

      // Update prompt upvotes
      const prompt = await tx.prompt.update({
        where: { id: promptId },
        data: {
          upvotes: {
            increment: value,
          },
        },
      });

      return { upvotes: prompt.upvotes };
    });
  }

  // Add a comment to a prompt
  public async addComment(
    userId: string,
    promptId: string,
    content: string
  ): Promise<{
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      imageUrl: string | null;
    };
  }> {
    const commentService = CommentService.getInstance();
    const comment = await commentService.createComment(promptId, userId, content);
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        imageUrl: comment.user.imageUrl,
      },
    };
  }

  // Get comments for a prompt
  public async getComments(
    promptId: string,
    options: {
      page?: number;
      limit?: number;
      orderBy?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
        imageUrl: string | null;
      };
    }>;
    total: number;
  }> {
    const { page = 1, limit = 10, orderBy = 'desc' } = options;
    const commentService = CommentService.getInstance();
    const result = await commentService.getComments(promptId, page, limit, 'createdAt', orderBy);
    
    return {
      comments: result.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          imageUrl: comment.user.imageUrl,
        },
      })),
      total: result.total,
    };
  }

  // Get user's vote on a prompt
  public async getUserVote(userId: string, promptId: string): Promise<number | null> {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });

    return vote?.value ?? null;
  }
}
