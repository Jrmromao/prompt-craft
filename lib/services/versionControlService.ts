import { prisma } from '@/lib/prisma';
import { diffWords } from 'diff';
import crypto from 'crypto';

interface Version {
  id: string;
  content: string;
  convertedToPrompt: boolean;
  userId: string;
  promptId: string | null;
  createdAt: Date;
  updatedAt: Date;
  prompt: {
    user: {
      name: string | null;
      email: string | null;
      imageUrl: string | null;
    } | null;
  } | null;
}

export class VersionControlService {
  private static instance: VersionControlService;

  private constructor() {}

  public static getInstance(): VersionControlService {
    if (!VersionControlService.instance) {
      VersionControlService.instance = new VersionControlService();
    }
    return VersionControlService.instance;
  }

  // Create a new version of a prompt
  public async createVersion(
    promptId: string,
    content: string,
    description: string | null,
    commitMessage: string,
    tags: string[],
    baseVersionId?: string,
    tests?: Array<{ input?: string; output: string; rating?: { clarity: number; specificity: number; context: number; overall: number; feedback: string; } }>
  ) {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: { 
        versions: true,
        tags: true 
      },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // If this is the first version, create v1 with the original prompt content
    if (prompt.versions.length === 0) {
      await prisma.version.create({
        data: {
          content: prompt.content,
          userId: prompt.userId,
          promptId,
          tests: {
            create: {
              id: crypto.randomUUID(),
              output: 'Initial version',
              updatedAt: new Date(),
            }
          }
        },
        include: {
          prompt: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });
    }

    // If baseVersionId is provided, verify it exists
    if (baseVersionId) {
      const baseVersion = await prisma.version.findUnique({
        where: { id: baseVersionId },
      });
      if (!baseVersion) {
        throw new Error('Base version not found');
      }
    }

    // Create the new version
    const version = await prisma.version.create({
      data: {
        content,
        userId: prompt.userId,
        promptId,
        tests: tests ? {
          create: tests.map(test => ({
            id: crypto.randomUUID(),
            input: test.input,
            output: test.output,
            updatedAt: new Date(),
            PromptRating: test.rating ? {
              create: {
                clarity: test.rating.clarity,
                specificity: test.rating.specificity,
                context: test.rating.context,
                overall: test.rating.overall,
                feedback: test.rating.feedback,
              },
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        prompt: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return version;
  }

  // Get version history for a prompt
  public async getVersion(promptId: string) {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        tags: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            prompt: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // If there are no versions yet, create v1 with the original prompt content
    if (prompt.versions.length === 0) {
      const v1 = await prisma.version.create({
        data: {
          content: prompt.content,
          userId: prompt.userId,
          promptId,
          tests: {
            create: {
              id: crypto.randomUUID(),
              output: 'Initial version',
              updatedAt: new Date(),
            }
          }
        },
        include: {
          prompt: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });
      return [v1];
    }

    return prompt.versions;
  }

  // Get a specific version by ID
  public async getVersionById(versionId: string): Promise<Version | null> {
    return prisma.version.findUnique({
      where: { id: versionId },
      include: {
        prompt: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // Compare two versions
  public async compareVersions(version1: string, version2: string) {
    const v1 = await this.getVersionById(version1);
    const v2 = await this.getVersionById(version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    // Content diff
    const contentDiff = diffWords(v1.content, v2.content);

    return {
      version1: v1,
      version2: v2,
      contentDiff,
    };
  }

  // Rollback to a specific version
  public async rollbackToVersion(promptId: string, versionId: string) {
    const version = await this.getVersionById(versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Create a new version with the content from the target version
    return this.createVersion(
      promptId,
      version.content,
      'Rollback to version ' + versionId,
      'Rollback to version ' + versionId,
      [],
      versionId
    );
  }

  private detectChanges(oldContent: string, newContent: string) {
    return diffWords(oldContent, newContent);
  }
}
