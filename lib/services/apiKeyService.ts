import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

export class ApiKeyService {
  private static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private static decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static async saveApiKey(
    userId: string,
    provider: 'openai' | 'anthropic',
    apiKey: string
  ): Promise<void> {
    const encrypted = this.encrypt(apiKey);
    const preview = apiKey.slice(-4);

    await prisma.apiKey.upsert({
      where: {
        userId_provider: { userId, provider },
      },
      update: {
        encryptedKey: encrypted,
        keyPreview: preview,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        provider,
        encryptedKey: encrypted,
        keyPreview: preview,
        isActive: true,
      },
    });
  }

  static async getApiKey(
    userId: string,
    provider: 'openai' | 'anthropic'
  ): Promise<string | null> {
    const record = await prisma.apiKey.findUnique({
      where: {
        userId_provider: { userId, provider },
        isActive: true,
      },
    });

    if (!record) return null;

    await prisma.apiKey.update({
      where: { id: record.id },
      data: {
        lastUsed: new Date(),
        usageCount: { increment: 1 },
      },
    });

    return this.decrypt(record.encryptedKey);
  }

  static async deleteApiKey(
    userId: string,
    provider: 'openai' | 'anthropic'
  ): Promise<void> {
    await prisma.apiKey.update({
      where: {
        userId_provider: { userId, provider },
      },
      data: {
        isActive: false,
      },
    });
  }

  static async listApiKeys(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        provider: true,
        keyPreview: true,
        lastUsed: true,
        usageCount: true,
        createdAt: true,
      },
    });
  }
}
