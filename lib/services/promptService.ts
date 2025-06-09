import { prisma } from '@/lib/prisma';
import { Role, PlanType } from '@/utils/constants';
import { Prisma, Prompt as PrismaPrompt } from '@prisma/client';

// Use Prisma's generated type instead of custom interface
type Prompt = Omit<PrismaPrompt, 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'lastViewedAt'> & {
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  lastViewedAt: string | null;
  tags: { id: string; name: string }[];
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  upvotes: number;
  _count: {
    votes: number;
  };
};

type PrismaPromptWithRelations = {
  id: string;
  name: string;
  content: string;
  description: string | null;
  isPublic: boolean;
  upvotes: number;
  slug: string;
  lastUsedAt: Date | null;
  lastViewedAt: Date | null;
  usageCount: number;
  viewCount: number;
  copyCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags: {
    id: string;
    name: string;
  }[];
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  _count: {
    votes: number;
  };
};

// Type guard to check if an object is a PrismaPromptWithRelations
function isPrismaPromptWithRelations(obj: unknown): obj is PrismaPromptWithRelations {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'createdAt' in obj &&
    'updatedAt' in obj &&
    'tags' in obj
  );
}

// Type guard to check if an array contains PrismaPromptWithRelations
function isPrismaPromptWithRelationsArray(arr: unknown): arr is PrismaPromptWithRelations[] {
  return Array.isArray(arr) && arr.every(isPrismaPromptWithRelations);
}

type PrismaPromptResponse = Prisma.Prisma__PromptClient<PrismaPromptWithRelations>;

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

  /**
   * Safely converts a Prisma prompt to our custom Prompt type
   * @throws Error if the conversion fails
   */
  private convertDatesToStrings(prompt: PrismaPromptWithRelations): Prompt {
    try {
      return {
        ...prompt,
        createdAt: prompt.createdAt.toISOString(),
        updatedAt: prompt.updatedAt.toISOString(),
        lastUsedAt: prompt.lastUsedAt?.toISOString() || null,
        lastViewedAt: prompt.lastViewedAt?.toISOString() || null,
        user: {
          id: prompt.user.id,
          name: prompt.user.name,
          imageUrl: prompt.user.imageUrl,
        },
        upvotes: prompt._count.votes,
        _count: {
          votes: prompt._count.votes,
        },
      };
    } catch (error) {
      console.error('Error converting dates to strings:', error);
      throw new Error('Failed to convert prompt dates to strings');
    }
  }

  /**
   * Safely converts an array of Prisma prompts to our custom Prompt type
   * @throws Error if the conversion fails
   */
  private convertPromptsArray(prompts: PrismaPromptWithRelations[]): Prompt[] {
    try {
      return prompts.map(p => this.convertDatesToStrings(p));
    } catch (error) {
      throw new Error(`Failed to convert prompts array: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Safely handles Prisma query results and converts them to our custom Prompt type
   * @throws Error if the conversion fails
   */
  private async handlePrismaResult<T>(
    promise: Promise<T>
  ): Promise<T extends Array<infer U> ? Prompt[] : Prompt> {
    try {
      const result = await promise;
      if (Array.isArray(result)) {
        return result.map(item => this.convertDatesToStrings(item as PrismaPromptWithRelations)) as T extends Array<infer U> ? Prompt[] : Prompt;
      }
      return this.convertDatesToStrings(result as PrismaPromptWithRelations) as T extends Array<infer U> ? Prompt[] : Prompt;
    } catch (error) {
      throw new Error(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    // Generate a unique slug for the prompt
    const { aiSlugify } = await import('./slugService');
    const baseSlug = await aiSlugify(data.name, data.description || '');
    let uniqueSlug = baseSlug;
    let i = 1;
    while (await prisma.prompt.findFirst({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${i}`;
      i++;
    }

    const prompt = await prisma.prompt.create({
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        isPublic: data.isPublic || false,
        userId,
        slug: uniqueSlug,
        tags: {
          connectOrCreate: (data.tags || []).map(tag => ({
            where: { name: tag },
            create: {
              name: tag,
              slug: tag.toLowerCase().replace(/\s+/g, '-'),
            },
          })),
        },
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
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

    return this.convertDatesToStrings(prompt as PrismaPromptWithRelations);
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
              id: true,
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
      prompts: (prompts as PrismaPromptWithRelations[]).map(p => this.convertDatesToStrings(p)),
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
            id: true,
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

    return prompt ? this.convertDatesToStrings(prompt as PrismaPromptWithRelations) : null;
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
            id: true,
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

    return this.convertDatesToStrings(updatedPrompt as PrismaPromptWithRelations);
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
    return this.handlePrismaResult(
      prisma.prompt.update({
        where: { id: promptId },
        data: { isPublic: true },
        include: {
          tags: true,
          user: {
            select: {
              id: true,
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
      })
    );
  }

  // Admin: Reject (delete) a prompt
  public async rejectPrompt(promptId: string): Promise<void> {
    await prisma.prompt.delete({ where: { id: promptId } });
  }

  // Admin: Get prompts pending review (public but not approved)
  public async getPendingPrompts(): Promise<Prompt[]> {
    return this.handlePrismaResult(
      prisma.prompt.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
          user: {
            select: {
              id: true,
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
      })
    );
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
            id: true,
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

    return this.convertDatesToStrings(updatedPrompt as PrismaPromptWithRelations);
  }

  // Get top N public prompts for landing page/SEO
  public async getFeaturedPrompts(limit: number = 3): Promise<Prompt[]> {
    return this.handlePrismaResult(
      prisma.prompt.findMany({
        where: {
          isPublic: true,
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
              id: true,
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
      })
    );
  }

  /**
   * Duplicate a prompt for a user
   */
  async copyPrompt(promptId: string, userId: string): Promise<Prompt> {
    const originalPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
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

    if (!originalPrompt) {
      throw new Error('Prompt not found');
    }

    // Generate a unique slug for the copy
    const { aiSlugify } = await import('./slugService');
    const baseSlug = await aiSlugify(originalPrompt.name, originalPrompt.description || '');
    let uniqueSlug = `${baseSlug}-copy`;
    let i = 1;
    while (await prisma.prompt.findFirst({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-copy-${i}`;
      i++;
    }

    const copiedPrompt = await prisma.prompt.create({
      data: {
        name: `${originalPrompt.name} (Copy)`,
        description: originalPrompt.description,
        content: originalPrompt.content,
        isPublic: false,
        userId,
        slug: uniqueSlug,
        tags: {
          connect: originalPrompt.tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
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

    return this.convertDatesToStrings(copiedPrompt as PrismaPromptWithRelations);
  }

  public async getUserPrompts(userId: string): Promise<Prompt[]> {
    return this.handlePrismaResult(
      prisma.prompt.findMany({
        where: { userId },
        include: {
          tags: true,
          user: {
            select: {
              id: true,
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
      })
    );
  }

  async getPublicPrompts(page: number = 1, limit: number = 10): Promise<{ prompts: Prompt[]; total: number }> {
    const skip = (page - 1) * limit;
    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where: { isPublic: true },
        skip,
        take: limit,
        include: {
          tags: true,
          user: {
            select: {
              id: true,
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
      prisma.prompt.count({ where: { isPublic: true } }),
    ]);

    return {
      prompts: this.convertPromptsArray(prompts as PrismaPromptWithRelations[]),
      total,
    };
  }
}
