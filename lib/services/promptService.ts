import { prisma } from '@/lib/prisma';
import { Role } from '@/utils/constants';
import { Prisma } from '@prisma/client';

interface Prompt {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  content: string;
  isPublic: boolean;
  promptType: string;
  metadata: any | null;
  createdAt: Date;
  updatedAt: Date;
  tags: { id: string; name: string }[];
  isApproved: boolean;
  upvotes: number;
  slug: string;
}

export class PromptService {
  private static instance: PromptService;
  private readonly PROMPT_LIMITS: Record<Role, number> = {
    [Role.FREE]: 10,
    [Role.LITE]: 50,
    [Role.PRO]: Infinity,
    [Role.ADMIN]: Infinity,
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
      promptType?: string;
      metadata?: any;
      tags?: string[];
    }
  ): Promise<Prompt> {

    console.log('\n\n\n\n/nuserId', userId);

    // Check user's prompt limit
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });


    if (!user) {
      throw new Error('User not found');
    }

    console.log('\n\n\nuserId', user);

    const promptLimit = this.PROMPT_LIMITS[user.role as Role];
    if (promptLimit !== Infinity) {
      const promptCount = await prisma.prompt.count({
        where: { userId },
      });

      console.log('\n\n\npromptCount', promptCount);
      console.log('\n\n\npromptLimit', promptLimit);

      if (promptCount >= promptLimit) {
        throw new Error(`You have reached your prompt limit of ${promptLimit}. Please upgrade to save more prompts.`);
      }
    }

    // Generate a unique slug for the prompt
    const { aiSlugify } = await import('./slugService');
    let baseSlug = await aiSlugify(data.name, data.description || '');
    let uniqueSlug = baseSlug;
    let i = 1;
    while (await prisma.prompt.findFirst({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${i}`;
      i++;
    }

    // Create or find tags
    const tagOperations = (data.tags || []).map(tagName => ({
      where: { name: tagName },
      create: { name: tagName },
    }));

    // Create prompt with tags and unique slug
    const prompt = await prisma.prompt.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        content: data.content,
        isPublic: data.isPublic || false,
        promptType: data.promptType || 'text',
        metadata: data.metadata || null,
        slug: uniqueSlug,
        tags: {
          connectOrCreate: tagOperations,
        },
      },
      include: {
        tags: true,
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
      OR: [
        { userId },
        ...(includePublic ? [{ isPublic: true }] : []),
      ],
      ...(tags?.length ? {
        tags: {
          some: {
            name: {
              in: tags,
            },
          },
        },
      } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      } : {}),
    };

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          tags: true,
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
      },
    });

    return prompt as Prompt | null;
  }

  public async updatePrompt(
    id: string,
    userId: string,
    updates: Partial<Prompt>
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
    const tagOperations = updates.tags ? {
      set: [], // Clear existing tags
      connectOrCreate: updates.tags.map(tag => ({
        where: { name: tag.name },
        create: { name: tag.name },
      })),
    } : undefined;

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...updates,
        tags: tagOperations,
      },
      include: {
        tags: true,
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
      data: { isApproved: true },
      include: { tags: true },
    }) as Promise<Prompt>;
  }

  // Admin: Reject (delete) a prompt
  public async rejectPrompt(promptId: string): Promise<void> {
    await prisma.prompt.delete({ where: { id: promptId } });
  }

  // Admin: Get prompts pending review (public but not approved)
  public async getPendingPrompts(): Promise<Prompt[]> {
    return prisma.prompt.findMany({
      where: { isPublic: true, isApproved: false },
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
    }) as Promise<Prompt[]>;
  }

  // Update upvotePrompt to auto-approve if upvotes exceed threshold
  public async upvotePrompt(promptId: string): Promise<Prompt> {
    const threshold = 100;
    const prompt = await prisma.prompt.update({
      where: { id: promptId },
      data: { upvotes: { increment: 1 } },
      include: { tags: true },
    });
    if (!prompt.isApproved && prompt.upvotes >= threshold) {
      await prisma.prompt.update({
        where: { id: promptId },
        data: { isApproved: true },
      });
      prompt.isApproved = true;
    }
    return prompt as Prompt;
  }

  // Get top N public, approved prompts for landing page/SEO
  public async getFeaturedPrompts(limit: number = 3): Promise<Prompt[]> {
    return prisma.prompt.findMany({
      where: { isPublic: true, isApproved: true },
      orderBy: [
        { upvotes: 'desc' },
        { createdAt: 'desc' },
      ],
      include: { tags: true },
      take: limit,
    }) as Promise<Prompt[]>;
  }
}