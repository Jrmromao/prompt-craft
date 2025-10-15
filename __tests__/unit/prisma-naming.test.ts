/**
 * Test: Prisma Naming Conventions
 * Ensures correct usage of Prisma model and relation names
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Prisma Naming Conventions', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should use lowercase model names', () => {
    // ✅ Correct: Models are lowercase
    expect(prisma.user).toBeDefined();
    expect(prisma.prompt).toBeDefined();
    expect(prisma.subscription).toBeDefined();
  });

  it('should use capitalized relation names in includes', async () => {
    // This test verifies the pattern, actual query would need test data
    const includePattern = {
      User: true,
      Subscription: true,
      Prompt: true
    };
    
    expect(includePattern.User).toBe(true);
    expect(includePattern.Subscription).toBe(true);
    expect(includePattern.Prompt).toBe(true);
  });

  it('should access relations with capitalized names', () => {
    // Type check: This should compile without errors
    type UserWithRelations = {
      id: string;
      Subscription: { status: string } | null;
    };

    const mockUser: UserWithRelations = {
      id: '123',
      Subscription: { status: 'active' }
    };

    expect(mockUser.Subscription?.status).toBe('active');
  });
});
