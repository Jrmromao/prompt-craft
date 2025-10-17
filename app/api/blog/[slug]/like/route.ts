import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, number>();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}-${slug}`;
    
    // Rate limit: 1 like per 10 seconds per IP per post
    const lastLike = rateLimitMap.get(key);
    const now = Date.now();
    
    if (lastLike && now - lastLike < 10000) {
      return NextResponse.json({ error: 'Too fast' }, { status: 429 });
    }
    
    rateLimitMap.set(key, now);

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({ where: { slug } });
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = await prisma.blogPost.update({
      where: { slug },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
