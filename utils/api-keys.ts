import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// API Key schema
const apiKeySchema = z.object({
  name: z.string().min(3).max(50),
  expiresAt: z.date().optional(),
  scopes: z.array(z.string()).optional(),
});

export type ApiKey = z.infer<typeof apiKeySchema>;

// Generate a random string
async function generateRandomString(length: number): Promise<string> {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash a string using SHA-256
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a new API key
export async function generateApiKey(userId: string, data: ApiKey) {
  // Validate input
  apiKeySchema.parse(data);

  // Generate key parts
  const prefix = 'pk_';
  const randomPart = await generateRandomString(32);
  const fullKey = `${prefix}${randomPart}`;

  // Hash the key for storage
  const hashedKey = await hashString(fullKey);

  // Store in database
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name: data.name,
      hashedKey,
      expiresAt: data.expiresAt,
      scopes: data.scopes || [],
      lastRotatedAt: new Date(),
    },
  });

  // Return the full key only once
  return {
    id: apiKey.id,
    key: fullKey,
    expiresAt: apiKey.expiresAt,
  };
}

// Rotate an existing API key
export async function rotateApiKey(userId: string, keyId: string) {
  // Find the existing key
  const existingKey = await prisma.apiKey.findFirst({
    where: {
      id: keyId,
      userId,
    },
  });

  if (!existingKey) {
    throw new Error('API key not found');
  }

  // Generate new key
  const prefix = 'pk_';
  const randomPart = await generateRandomString(32);
  const fullKey = `${prefix}${randomPart}`;
  const hashedKey = await hashString(fullKey);

  // Update the key in database
  const updatedKey = await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      hashedKey,
      lastRotatedAt: new Date(),
      // Keep the same expiration date
      expiresAt: existingKey.expiresAt,
    },
  });

  // Return the new key
  return {
    id: updatedKey.id,
    key: fullKey,
    expiresAt: updatedKey.expiresAt,
  };
}

// Validate an API key
export async function validateApiKey(key: string) {
  const hashedKey = await hashString(key);

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      hashedKey,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      user: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  if (!apiKey) {
    return null;
  }

  return {
    userId: apiKey.userId,
    scopes: apiKey.scopes,
    role: apiKey.user.role,
  };
}

// List user's API keys
export async function listApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastRotatedAt: true,
      expiresAt: true,
      scopes: true,
    },
  });
}

// Delete an API key
export async function deleteApiKey(userId: string, keyId: string) {
  return prisma.apiKey.deleteMany({
    where: {
      id: keyId,
      userId,
    },
  });
}

// Check for expired keys
export async function cleanupExpiredKeys() {
  return prisma.apiKey.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
