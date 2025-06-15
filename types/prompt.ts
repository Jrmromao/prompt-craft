import { Prompt as PrismaPrompt } from '@prisma/client';

export type Prompt = Omit<PrismaPrompt, 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'lastViewedAt'> & {
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  lastViewedAt: string | null;
  tags: { id: string; name: string }[];
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  upvotes: number;
  _count: {
    votes: number;
    comments?: number;
  };
  status?: string;
}; 