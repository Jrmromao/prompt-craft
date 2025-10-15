import { ApiKeyService } from '@/lib/services/apiKeyService';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ApiKeyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveApiKey', () => {
    it('should encrypt and save API key', async () => {
      mockPrisma.apiKey.upsert.mockResolvedValue({
        id: 'key-123',
        userId: 'user-123',
        provider: 'openai',
        encryptedKey: 'encrypted',
        keyPreview: '1234',
        isActive: true,
        lastUsed: null,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await ApiKeyService.saveApiKey('user-123', 'openai', 'sk-test1234');

      expect(mockPrisma.apiKey.upsert).toHaveBeenCalled();
      const call = mockPrisma.apiKey.upsert.mock.calls[0][0];
      expect(call.create.keyPreview).toBe('1234');
      expect(call.create.encryptedKey).toBeDefined();
      expect(call.create.encryptedKey).not.toBe('sk-test1234');
    });

    it('should update existing key', async () => {
      mockPrisma.apiKey.upsert.mockResolvedValue({} as any);

      await ApiKeyService.saveApiKey('user-123', 'openai', 'sk-new1234');

      const call = mockPrisma.apiKey.upsert.mock.calls[0][0];
      expect(call.where.userId_provider).toEqual({
        userId: 'user-123',
        provider: 'openai',
      });
    });
  });

  describe('getApiKey', () => {
    it('should decrypt and return API key', async () => {
      // First save a key to get encrypted version
      mockPrisma.apiKey.upsert.mockResolvedValue({
        id: 'key-123',
        encryptedKey: 'will-be-set',
      } as any);

      await ApiKeyService.saveApiKey('user-123', 'openai', 'sk-test1234');
      const encryptedKey = mockPrisma.apiKey.upsert.mock.calls[0][0].create.encryptedKey;

      // Now mock findUnique to return that encrypted key
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-123',
        userId: 'user-123',
        provider: 'openai',
        encryptedKey,
        keyPreview: '1234',
        isActive: true,
        lastUsed: null,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockPrisma.apiKey.update.mockResolvedValue({} as any);

      const decrypted = await ApiKeyService.getApiKey('user-123', 'openai');

      expect(decrypted).toBe('sk-test1234');
      expect(mockPrisma.apiKey.update).toHaveBeenCalled();
    });

    it('should return null if key not found', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      const result = await ApiKeyService.getApiKey('user-123', 'openai');

      expect(result).toBeNull();
    });

    it('should update lastUsed and usageCount', async () => {
      mockPrisma.apiKey.upsert.mockResolvedValue({
        id: 'key-123',
        encryptedKey: 'encrypted',
      } as any);

      await ApiKeyService.saveApiKey('user-123', 'openai', 'sk-test1234');
      const encryptedKey = mockPrisma.apiKey.upsert.mock.calls[0][0].create.encryptedKey;

      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-123',
        encryptedKey,
        isActive: true,
      } as any);

      mockPrisma.apiKey.update.mockResolvedValue({} as any);

      await ApiKeyService.getApiKey('user-123', 'openai');

      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-123' },
        data: {
          lastUsed: expect.any(Date),
          usageCount: { increment: 1 },
        },
      });
    });
  });

  describe('deleteApiKey', () => {
    it('should mark key as inactive', async () => {
      mockPrisma.apiKey.update.mockResolvedValue({} as any);

      await ApiKeyService.deleteApiKey('user-123', 'openai');

      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
        where: {
          userId_provider: {
            userId: 'user-123',
            provider: 'openai',
          },
        },
        data: {
          isActive: false,
        },
      });
    });
  });

  describe('listApiKeys', () => {
    it('should return all active keys for user', async () => {
      mockPrisma.apiKey.findMany.mockResolvedValue([
        {
          id: 'key-1',
          provider: 'openai',
          keyPreview: '1234',
          lastUsed: new Date(),
          usageCount: 10,
          createdAt: new Date(),
        },
        {
          id: 'key-2',
          provider: 'anthropic',
          keyPreview: '5678',
          lastUsed: null,
          usageCount: 0,
          createdAt: new Date(),
        },
      ] as any);

      const keys = await ApiKeyService.listApiKeys('user-123');

      expect(keys).toHaveLength(2);
      expect(keys[0].provider).toBe('openai');
      expect(keys[1].provider).toBe('anthropic');
    });

    it('should only return active keys', async () => {
      mockPrisma.apiKey.findMany.mockResolvedValue([]);

      await ApiKeyService.listApiKeys('user-123');

      expect(mockPrisma.apiKey.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', isActive: true },
        select: expect.any(Object),
      });
    });
  });
});
