import { prisma } from '@/lib/prisma';

interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  content: string;
  changes: string;
  createdAt: Date;
}

export class PromptVersionService {
  private static instance: PromptVersionService;

  static getInstance(): PromptVersionService {
    if (!PromptVersionService.instance) {
      PromptVersionService.instance = new PromptVersionService();
    }
    return PromptVersionService.instance;
  }

  async createVersion(promptId: string, content: string, changes: string): Promise<PromptVersion> {
    const latestVersion = await prisma.promptVersion.findFirst({
      where: { promptId },
      orderBy: { version: 'desc' }
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    return await prisma.promptVersion.create({
      data: {
        promptId,
        version: newVersion,
        content,
        changes
      }
    });
  }

  async getVersionHistory(promptId: string): Promise<PromptVersion[]> {
    return await prisma.promptVersion.findMany({
      where: { promptId },
      orderBy: { version: 'desc' }
    });
  }

  async rollbackToVersion(promptId: string, version: number): Promise<void> {
    const targetVersion = await prisma.promptVersion.findFirst({
      where: { promptId, version }
    });

    if (!targetVersion) throw new Error('Version not found');

    await prisma.prompt.update({
      where: { id: promptId },
      data: { content: targetVersion.content }
    });

    await this.createVersion(promptId, targetVersion.content, `Rolled back to version ${version}`);
  }
}
