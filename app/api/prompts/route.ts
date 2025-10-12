import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan and prompt count
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        Subscription: true,
        Prompt: { select: { id: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPro = user.Subscription?.status === 'ACTIVE' || user.planType === 'PRO';
    const promptCount = user.Prompt.length;

    // Enforce 10 prompt limit for free users
    if (!isPro && promptCount >= 10) {
      return NextResponse.json({ 
        error: 'Free plan limit reached. Upgrade to PRO for unlimited prompts.',
        code: 'LIMIT_REACHED'
      }, { status: 402 });
    }

    const { name, content, description, isPublic } = await request.json();

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const prompt = await prisma.prompt.create({
      data: {
        name,
        content,
        description: description || '',
        isPublic: isPublic || false,
        userId: user.id, // Use database user ID, not Clerk ID
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const prompts = await prisma.prompt.findMany({
      where: { userId: user.id }, // Use database user ID
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
