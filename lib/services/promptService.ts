import { prisma } from '@/lib/prisma';
import { Role, PlanType } from '@/utils/constants';
import { Prisma, Prompt as PrismaPrompt } from '@prisma/client';
import { AIService } from '@/lib/services/aiService';

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
    comments?: number;
  };
  dataRetentionPolicy: Prisma.JsonValue;
  isArchived: boolean;
  archivedAt: Date | null;
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
    [PlanType.PRO]: 50,
  };

  private readonly PRIVATE_PROMPT_LIMITS: Record<PlanType, number> = {
    [PlanType.FREE]: 5,
    [PlanType.PRO]: 50,
  };

  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }


  // Add inside the PromptService class
public async getPromptBySlug(slug: string): Promise<Prompt | null> {
  const prompt = await prisma.prompt.findFirst({
    where: { slug },
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
  return prompt ? this.convertDatesToStrings(prompt as any) : null;
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
        downvotes: (prompt as any).downvotes ?? 0,
        shareCount: (prompt as any).shareCount ?? 0,
        qualityScore: (prompt as any).qualityScore ?? 0,
        difficultyLevel: (prompt as any).difficultyLevel ?? 'unknown',
        _count: {
          votes: prompt._count.votes,
          comments: (prompt._count as any).comments ?? 0,
        },
        model: (prompt as any).model ?? 'gpt-3.5-turbo',
        metadata: (prompt as any).metadata ?? {},
        promptType: (prompt as any).promptType ?? 'default',
        responseTime: (prompt as any).responseTime ?? null,
        dataRetentionPolicy: (prompt as any).dataRetentionPolicy ?? {},
        isArchived: (prompt as any).isArchived ?? false,
        archivedAt: (prompt as any).archivedAt?.toISOString() ?? null,
        isVerified: (prompt as any).isVerified ?? false,
        isFeatured: (prompt as any).isFeatured ?? false,
        followerCount: (prompt as any).followerCount ?? 0,
        favoriteCount: (prompt as any).favoriteCount ?? 0,
        isPremium: (prompt as any).isPremium ?? false,
        premiumTier: (prompt as any).premiumTier ?? null,
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
      systemPrompt?: string;
      context?: string;
      examples?: string[];
      constraints?: string[];
      outputFormat?: string;
      temperature?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      maxTokens?: number;
      stopSequences?: string[];
      validationRules?: string[];
      fallbackStrategy?: string;
      version?: string;
      author?: string;
      source?: string;
    }
  ): Promise<Prompt> {
    // Validate required fields
    if (!data.name || !data.content) {
      throw new Error('Name and content are required');
    }

    // Validate AI/ML parameters
    if (data.temperature !== undefined && (data.temperature < 0 || data.temperature > 1)) {
      throw new Error('Temperature must be between 0 and 1');
    }

    if (data.topP !== undefined && (data.topP < 0 || data.topP > 1)) {
      throw new Error('Top P must be between 0 and 1');
    }

    if (data.frequencyPenalty !== undefined && (data.frequencyPenalty < -2 || data.frequencyPenalty > 2)) {
      throw new Error('Frequency penalty must be between -2 and 2');
    }

    if (data.presencePenalty !== undefined && (data.presencePenalty < -2 || data.presencePenalty > 2)) {
      throw new Error('Presence penalty must be between -2 and 2');
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

    // Prepare metadata
    const metadata = {
      systemPrompt: data.systemPrompt,
      context: data.context,
      examples: data.examples,
      constraints: data.constraints,
      outputFormat: data.outputFormat,
      temperature: data.temperature,
      topP: data.topP,
      frequencyPenalty: data.frequencyPenalty,
      presencePenalty: data.presencePenalty,
      maxTokens: data.maxTokens,
      stopSequences: data.stopSequences,
      validationRules: data.validationRules,
      fallbackStrategy: data.fallbackStrategy,
      version: data.version || '1.0.0',
      author: data.author,
      source: data.source,
      lastUpdated: new Date(),
    };

    // Optimize prompt content with AI
    let optimizedContent = data.content;
    try {
      const aiService = AIService.getInstance();
      const optimizationPrompt = `Rewrite and optimize the following prompt for clarity, effectiveness, and best practices. Only return the improved prompt, do not add any explanations.\n\nPrompt:\n${data.content}`;
      const aiResult = await aiService.generateText(optimizationPrompt, {
        model: 'gpt4',
        temperature: 0.3,
        maxTokens: 1000,
      });
      if (aiResult && aiResult.text) {
        optimizedContent = aiResult.text.trim();
      }
    } catch (err) {
      console.error('AI optimization failed, saving original content:', err);
    }

    const prompt = await prisma.prompt.create({
      data: {
        name: data.name,
        description: data.description,
        content: optimizedContent,
        isPublic: data.isPublic || false,
        userId,
        slug: uniqueSlug,
        metadata,
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

  async getPublicPrompts(
    page: number = 1, 
    limit: number = 10,
    options: {
      search?: string;
      sortBy?: string;
      tag?: string;
    } = {}
  ): Promise<{ prompts: Prompt[]; total: number }> {
    const { search, sortBy = 'most_popular', tag } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PromptWhereInput = {
      isPublic: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
      ...(tag
        ? {
            tags: {
              some: {
                name: { contains: tag, mode: Prisma.QueryMode.insensitive },
              },
            },
          }
        : {}),
    };

    // Build orderBy clause
    let orderBy: Prisma.PromptOrderByWithRelationInput[] = [];
    switch (sortBy) {
      case 'most_popular':
        orderBy = [
          { upvotes: 'desc' },
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'most_viewed':
        orderBy = [
          { viewCount: 'desc' },
          { upvotes: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'trending':
        // For trending, we'll use a combination of recent activity and popularity
        orderBy = [
          { updatedAt: 'desc' },
          { upvotes: 'desc' },
          { viewCount: 'desc' }
        ];
        break;
      default:
        orderBy = [{ createdAt: 'desc' }];
    }

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy,
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
      prompts: this.convertPromptsArray(prompts as PrismaPromptWithRelations[]),
      total,
    };
  }
}
