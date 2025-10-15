import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export class ApiKeyService {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);

  static async saveApiKey(userId: string, provider: string, apiKey: string): Promise<void> {
    const encrypted = this.encrypt(apiKey);
    
    await prisma.apiKey.upsert({
      where: {
        userId_provider: { userId, provider },
      },
      update: {
        encryptedKey: encrypted,
        lastUsed: new Date(),
      },
      create: {
        userId,
        provider,
        encryptedKey: encrypted,
        lastUsed: new Date(),
      },
    });
  }

  static async getApiKey(userId: string, provider: string): Promise<string | null> {
    const record = await prisma.apiKey.findUnique({
      where: {
        userId_provider: { userId, provider },
      },
    });

    if (!record) return null;

    await prisma.apiKey.update({
      where: { id: record.id },
      data: { lastUsed: new Date() },
    });

    return this.decrypt(record.encryptedKey);
  }

  private static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private static decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString();
  }
}
