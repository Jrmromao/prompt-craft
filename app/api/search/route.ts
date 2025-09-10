import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'prompts', 'templates', 'users']).optional().default('all'),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    
    const { q, type, limit } = searchSchema.parse({
      q: searchParams.get('q'),
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
    });

    const searchResults = await Promise.all([
      // Search prompts
      type === 'all' || type === 'prompts' ? prisma.prompt.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { tags: { hasSome: [q] } },
          ],
          isPublic: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          tags: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              uses: true,
            },
          },
        },
        take: Math.floor(limit / (type === 'all' ? 2 : 1)),
        orderBy: [
          { likes: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
      }) : [],

      // Search users
      type === 'all' || type === 'users' ? prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          createdAt: true,
          _count: {
            select: {
              prompts: true,
              followers: true,
            },
          },
        },
        take: Math.floor(limit / (type === 'all' ? 2 : 1)),
        orderBy: {
          followers: { _count: 'desc' },
        },
      }) : [],
    ]);

    const [prompts, users] = searchResults;

    const results = {
      prompts: prompts.map(prompt => ({
        ...prompt,
        type: 'prompt' as const,
        relevance: calculateRelevance(q, prompt.title, prompt.description),
      })),
      users: users.map(user => ({
        ...user,
        type: 'user' as const,
        relevance: calculateRelevance(q, user.name, user.email),
      })),
      total: prompts.length + users.length,
    };

    return NextResponse.json({
      success: true,
      data: results,
      query: q,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

function calculateRelevance(query: string, title: string, description?: string): number {
  const q = query.toLowerCase();
  const t = title.toLowerCase();
  const d = description?.toLowerCase() || '';
  
  let score = 0;
  
  // Exact title match
  if (t === q) score += 100;
  // Title starts with query
  else if (t.startsWith(q)) score += 80;
  // Title contains query
  else if (t.includes(q)) score += 60;
  
  // Description contains query
  if (d.includes(q)) score += 20;
  
  return score;
}
