import { prisma } from '@/lib/prisma';
import { diffWords } from 'diff';

interface Version {
  id: string;
  promptId: string;
  content: string;
  description: string | null;
  commitMessage: string | null;
  version: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  prompt: {
    user: {
      name: string | null;
      email: string | null;
      imageUrl: string | null;
    } | null;
  };
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
    tags: string[]
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
      await prisma.promptVersion.create({
        data: {
          promptId,
          content: prompt.content,
          description: 'Initial version',
          commitMessage: 'Initial version',
          tags: prompt.tags.map(tag => tag.name),
          version: '1',
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

    // Create the new version
    const version = await prisma.promptVersion.create({
      data: {
        promptId,
        content,
        description,
        commitMessage,
        tags,
        version: (prompt.versions.length + 1).toString(),
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
      const v1 = await prisma.promptVersion.create({
        data: {
          promptId,
          content: prompt.content,
          description: 'Initial version',
          commitMessage: 'Initial version',
          tags: prompt.tags.map(tag => tag.name),
          version: '1',
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
    return prisma.promptVersion.findUnique({
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
    // Description diff
    const descriptionDiff = diffWords(v1.description || '', v2.description || '');
    // Tags diff
    const oldTags = new Set(v1.tags);
    const newTags = new Set(v2.tags);
    const addedTags = [...newTags].filter(tag => !oldTags.has(tag));
    const removedTags = [...oldTags].filter(tag => !newTags.has(tag));

    // Metadata diff (commit message)
    const metadataDiff = [
      {
        key: 'commitMessage',
        oldVal: v1.commitMessage,
        newVal: v2.commitMessage,
      },
    ].filter(diff => diff.oldVal !== diff.newVal);

    return {
      version1: v1,
      version2: v2,
      contentDiff,
      descriptionDiff,
      tagsDiff: { added: addedTags, removed: removedTags },
      metadataDiff,
    };
  }

  // Rollback to a specific version
  public async rollbackToVersion(promptId: string, versionId: string) {
    const targetVersion = await this.getVersionById(versionId);
    if (!targetVersion) {
      throw new Error('Version not found');
    }

    // Create a new version with the old content
    return this.createVersion(
      promptId,
      targetVersion.content,
      targetVersion.description,
      `Rollback to version ${targetVersion.version}`,
      targetVersion.tags
    );
  }

  // Private helper to detect changes between versions
  private detectChanges(oldContent: string, newContent: string) {
    const differences = diffWords(oldContent, newContent);
    const added = differences.filter(d => d.added).length;
    const removed = differences.filter(d => d.removed).length;
    const total = differences.length;

    return {
      diff: differences,
      isMajor: added > 100 || removed > 100, // Major changes if more than 100 words changed
      isMinor: (added > 20 || removed > 20) && added <= 100 && removed <= 100, // Minor changes if 20-100 words changed
      added,
      removed,
      total,
    };
  }
}
