import { prisma } from '@/lib/prisma';
import { diffWords } from 'diff';

interface Version {
  id: string;
  promptId: string;
  content: string;
  createdAt: Date;
  prompt: {
    user: {
      name: string | null;
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
      include: {
        prompt: {
          select: {
            user: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // Get a specific version by ID
  public async getVersion(versionId: string): Promise<Version | null> {
    return prisma.promptVersion.findUnique({
      where: { id: versionId },
      include: {
        prompt: {
          select: {
            user: {
              select: {
                name: true,
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
    const v1 = await this.getVersion(version1);
    const v2 = await this.getVersion(version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    // Compare content
    const differences = diffWords(v1.content, v2.content);
    const diff = differences.map(part => ({
      value: part.value,
      added: part.added || false,
      removed: part.removed || false,
    }));

    return {
      version1: v1,
      version2: v2,
      diff,
    };
  }

  // Compare metadata between versions
  private compareMetadata(metadata1: any, metadata2: any) {
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    
    // Compare each metadata field
    const allFields = new Set([...Object.keys(metadata1 || {}), ...Object.keys(metadata2 || {})]);
    
    allFields.forEach(field => {
      const oldValue = metadata1?.[field];
      const newValue = metadata2?.[field];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue,
          newValue
        });
      }
    });

    return changes;
  }

  // Compare tags between versions
  private compareTags(tags1: { name: string }[], tags2: { name: string }[]) {
    const oldTags = new Set(tags1.map(t => t.name));
    const newTags = new Set(tags2.map(t => t.name));
    
    const added = [...newTags].filter(tag => !oldTags.has(tag));
    const removed = [...oldTags].filter(tag => !newTags.has(tag));
    
    return {
      added,
      removed,
      unchanged: [...oldTags].filter(tag => newTags.has(tag))
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