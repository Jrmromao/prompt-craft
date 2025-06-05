import { prisma } from '@/lib/prisma';
import { diffWords } from 'diff';

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
    content: string
  ) {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Create the new version
    const version = await prisma.promptVersion.create({
      data: {
        promptId,
        content,
      },
    });

    return version;
  }

  // Get version history for a prompt
  public async getVersionHistory(promptId: string) {
    return prisma.promptVersion.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get a specific version by ID
  public async getVersion(versionId: string) {
    return prisma.promptVersion.findUnique({
      where: { id: versionId },
    });
  }

  // Compare two versions
  public async compareVersions(version1Id: string, version2Id: string) {
    const [v1, v2] = await Promise.all([
      this.getVersion(version1Id),
      this.getVersion(version2Id),
    ]);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    return {
      version1: v1,
      version2: v2,
      diff: this.detectChanges(v1.content, v2.content),
    };
  }

  // Rollback to a specific version
  public async rollbackToVersion(promptId: string, versionId: string) {
    const targetVersion = await this.getVersion(versionId);
    if (!targetVersion) {
      throw new Error('Version not found');
    }

    // Create a new version with the old content
    return this.createVersion(promptId, targetVersion.content);
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
      isMinor: (added > 20 || removed > 20) && (added <= 100 && removed <= 100), // Minor changes if 20-100 words changed
      added,
      removed,
      total,
    };
  }
} 