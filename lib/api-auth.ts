import { prisma } from '@/lib/prisma';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';

export async function validateApiToken(token: string): Promise<boolean> {
  try {
    // Hash the provided token to compare with stored hash
    const hashedToken = createHash('sha256').update(token).digest('hex');
    
    // Look up the token in the database
    const apiKey = await prisma.apiKey.findUnique({
      where: { 
        hashedKey: hashedToken,
      },
      include: {
        User: true
      }
    });

    if (!apiKey) {
      return false;
    }

    // Check if token is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return false;
    }

    // Update last used timestamp (this is fine to do on every request)
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastRotatedAt: new Date() }
    });

    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

export async function createApiToken(userId: string, name: string, scopes: string[] = ['read'], expiresAt?: Date) {
  // Generate a secure random token (this is what the user will use)
  const token = createHash('sha256')
    .update(randomUUID() + Date.now().toString())
    .digest('hex')
    .substring(0, 32);

  // Hash the token for storage
  const hashedToken = createHash('sha256').update(token).digest('hex');

  const apiKey = await prisma.apiKey.create({
    data: {
      id: randomUUID(),
      name,
      hashedKey: hashedToken,
      userId,
      scopes,
      expiresAt,
      lastRotatedAt: new Date(),
      updatedAt: new Date(),
    }
  });

  return { token, apiKey };
}

