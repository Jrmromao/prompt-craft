import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const [prompts, users, tags] = await Promise.all([
      // Search prompts
      prisma.prompt.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
          isPublic: true,
        },
        select: { id: true, title: true },
        take: 5,
      }),

      // Search users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, username: true },
        take: 3,
      }),

      // Search tags (from prompts)
      prisma.prompt.findMany({
        where: {
          tags: { has: query.toLowerCase() },
          isPublic: true,
        },
        select: { tags: true },
        take: 5,
      }),
    ]);

    const suggestions = [
      ...prompts.map(p => ({
        id: p.id,
        title: p.title,
        type: 'prompt' as const,
      })),
      ...users.map(u => ({
        id: u.id,
        title: u.name || u.username || 'Unknown',
        type: 'user' as const,
      })),
      ...Array.from(new Set(tags.flatMap(t => t.tags)))
        .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(tag => ({
          id: tag,
          title: `#${tag}`,
          type: 'tag' as const,
        })),
    ];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
