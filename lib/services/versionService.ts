import { trackUserFlowEvent, trackUserFlowError } from '@/lib/error-tracking';
import { prisma } from '@/lib/prisma';

export class VersionService {
  // ... existing code ...

  async convertVersionToPrompt(versionId: string, userId: string) {
    try {
      trackUserFlowEvent('version_conversion', 'start', { 
        userId,
        versionId,
        timestamp: new Date().toISOString()
      });

      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      const prompt = await this.createPromptFromVersion(version, userId);

      trackUserFlowEvent('version_conversion', 'success', {
        userId,
        versionId,
        promptId: prompt?.id,
        conversionTime: version.createdAt ? Date.now() - new Date(version.createdAt).getTime() : undefined
      });

      return prompt;
    } catch (error) {
      trackUserFlowError('version_conversion', error as Error, {
        userId,
        versionId,
        action: 'convert_to_prompt'
      });
      throw error;
    }
  }

  private async createPromptFromVersion(version: any, userId: string): Promise<{ id: string }> {
    // Implementation of version to prompt conversion
    // ... existing code ...
    return { id: 'dummy-id' };
  }

  async getVersion(versionId: string) {
    return prisma.version.findUnique({
      where: { id: versionId },
    });
  }
} 