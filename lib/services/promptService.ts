import { prisma } from '@/lib/prisma';
import { Role, PlanType } from '@/utils/constants';
import { Prisma, Prompt as PrismaPrompt } from '@prisma/client';

// Use Prisma's generated type instead of custom interface
type Prompt = {
  id: string;
  name: string;
  content: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
  user: {
    name: string | null;
    imageUrl: string | null;
  };
  _count: {
    comments: number;
    votes: number;
  };
};

export class PromptService {
  private static instance: PromptService;
  private readonly PROMPT_LIMITS: Record<PlanType, number> = {
    [PlanType.FREE]: 10,
    [PlanType.LITE]: 50,
    [PlanType.PRO]: Infinity,
  };

  private readonly PRIVATE_PROMPT_LIMITS: Record<PlanType, number> = {
    [PlanType.FREE]: 5,
    [PlanType.LITE]: 200,
    [PlanType.PRO]: Infinity,
  };

  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  public async savePrompt(
    userId: string,
    data: {
      name: string;
      description?: string;
      content: string;
      isPublic?: boolean;
      tags?: string[];
    }
  ): Promise<Prompt> {
    // Get user's plan type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const planType = user.planType as PlanType;
    const isPrivate = !data.isPublic;

    // Check private prompt limit if the prompt is private
    if (isPrivate) {
      const privatePromptLimit = this.PRIVATE_PROMPT_LIMITS[planType];
      if (privatePromptLimit !== Infinity) {
        const privatePromptCount = await prisma.prompt.count({
          where: {
            userId,
            isPublic: false,
          },
        });

        if (privatePromptCount >= privatePromptLimit) {
          throw new Error(
            `You have reached your private prompt limit of ${privatePromptLimit}. Please upgrade to save more private prompts.`
          );
        }
      }
    }

    // Check total prompt limit
    const promptLimit = this.PROMPT_LIMITS[planType];
    if (promptLimit !== Infinity) {
      const promptCount = await prisma.prompt.count({
        where: { userId },
      });

      if (promptCount >= promptLimit) {
        throw new Error(
          `You have reached your prompt limit of ${promptLimit}. Please upgrade to save more prompts.`
        );
      }
    }

    // Generate a unique slug for the prompt
    const { aiSlugify } = await import('./slugService');
    const baseSlug = await aiSlugify(data.name, data.description || '');
    let uniqueSlug = baseSlug;
    let i = 1;
    while (await prisma.prompt.findFirst({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${i}`;
      i++;
    }

    // Create or find tags
    const tagOperations = (data.tags || []).map(tag => ({
      where: { name: tag },
      create: {
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, '-'),
      },
    }));

    // Create prompt with tags and unique slug
    const prompt = await prisma.prompt.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        content: data.content,
        isPublic: data.isPublic || false,
        slug: uniqueSlug,
        tags: {
          connectOrCreate: tagOperations,
        },
      },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return prompt as Prompt;
  }

  public async getPrompts(
    userId: string,
    options: {
      includePublic?: boolean;
      tags?: string[];
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ prompts: Prompt[]; total: number }> {
    const { includePublic = false, tags, search, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.PromptWhereInput = {
      OR: [{ userId }, ...(includePublic ? [{ isPublic: true }] : [])],
      ...(tags?.length
        ? {
            tags: {
              some: {
                name: {
                  in: tags,
                },
              },
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          tags: true,
          user: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
      }),
      prisma.prompt.count({ where }),
    ]);

    return {
      prompts: prompts as Prompt[],
      total,
    };
  }

  public async getPrompt(id: string): Promise<Prompt | null> {
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return prompt as Prompt | null;
  }

  public async updatePrompt(
    id: string,
    userId: string,
    data: {
      name?: string;
      content?: string;
      description?: string;
      isPublic?: boolean;
      tags?: string[];
    }
  ): Promise<Prompt> {
    const prompt = await prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    if (prompt.userId !== userId) {
      throw new Error('Unauthorized to update this prompt');
    }

    // Handle tag updates if provided
    const tagOperations = data.tags
      ? {
          set: [], // Clear existing tags
          connectOrCreate: data.tags.map(tag => ({
            where: { name: tag },
            create: {
              name: tag,
              slug: tag.toLowerCase().replace(/\s+/g, '-'),
            },
          })),
        }
      : undefined;

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        name: data.name,
        content: data.content,
        description: data.description,
        isPublic: data.isPublic,
        tags: tagOperations,
      },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return updatedPrompt as Prompt;
  }

  public async deletePrompt(id: string, userId: string): Promise<void> {
    const prompt = await prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    if (prompt.userId !== userId) {
      throw new Error('Unauthorized to delete this prompt');
    }

    await prisma.prompt.delete({
      where: { id },
    });
  }

  // Admin: Approve a prompt
  public async approvePrompt(promptId: string): Promise<Prompt> {
    return prisma.prompt.update({
      where: { id: promptId },
      data: { isPublic: true },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    }) as Promise<Prompt>;
  }

  // Admin: Reject (delete) a prompt
  public async rejectPrompt(promptId: string): Promise<void> {
    await prisma.prompt.delete({ where: { id: promptId } });
  }

  // Admin: Get prompts pending review (public but not approved)
  public async getPendingPrompts(): Promise<Prompt[]> {
    return prisma.prompt.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    }) as Promise<Prompt[]>;
  }

  /**
   * Upvote a prompt
   */
  async upvotePrompt(promptId: string, userId: string): Promise<Prompt> {
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) throw new Error('Prompt not found');

    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: { upvotes: { increment: 1 } },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return updatedPrompt as Prompt;
  }

  // Get top N public prompts for landing page/SEO
  public async getFeaturedPrompts(limit: number = 3): Promise<Prompt[]> {
    return prisma.prompt.findMany({
      where: {
        isPublic: true,
        // Ensure we have some minimum engagement
        OR: [{ upvotes: { gt: 0 } }, { viewCount: { gt: 0 } }, { usageCount: { gt: 0 } }],
      },
      orderBy: [
        { upvotes: 'desc' },
        { viewCount: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      take: limit,
    }) as Promise<Prompt[]>;
  }

  /**
   * Duplicate a prompt for a user
   */
  async copyPrompt(promptId: string, userId: string): Promise<Prompt> {
    // Fetch the original prompt
    const original = await prisma.prompt.findUnique({ 
      where: { id: promptId },
      include: { tags: true }
    });
    
    if (!original) throw new Error('Prompt not found');

    // Generate a unique slug for the copy
    const { aiSlugify } = await import('./slugService');
    const baseSlug = await aiSlugify(original.name, original.description || '');
    let uniqueSlug = `${baseSlug}-copy`;
    let i = 1;
    while (await prisma.prompt.findFirst({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-copy-${i}`;
      i++;
    }

    // Create a copy for the user
    const copy = await prisma.prompt.create({
      data: {
        userId,
        content: original.content,
        name: `${original.name} (Copy)`,
        description: original.description,
        isPublic: false, // Copies are private by default
        slug: uniqueSlug,
        tags: {
          connect: original.tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return copy as Prompt;
  }

  public async getUserPrompts(userId: string): Promise<Prompt[]> {
    return prisma.prompt.findMany({
      where: {
        userId,
      },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }) as Promise<Prompt[]>;
  }

  public async getPublicPrompts(): Promise<Prompt[]> {
    const prompts = await prisma.prompt.findMany({
      where: { isPublic: true },
      include: {
        tags: true,
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prompts.map(prompt => ({
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      description: prompt.description,
      isPublic: prompt.isPublic,
      createdAt: prompt.createdAt.toISOString(),
      updatedAt: prompt.updatedAt.toISOString(),
      tags: prompt.tags.map(tag => ({ id: tag.id, name: tag.name })),
      user: {
        name: prompt.user?.name,
        imageUrl: prompt.user?.imageUrl,
      },
      _count: {
        comments: prompt._count.comments,
        votes: prompt._count.votes,
      },
    }));
  }
}
