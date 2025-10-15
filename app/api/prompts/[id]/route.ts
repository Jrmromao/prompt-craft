import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Try to find by slug first, then by ID as fallback
    const prompt = await prisma.prompt.findFirst({
      where: { 
        OR: [
          { slug: id, userId: user.id },
          { id: id, userId: user.id }
        ]
      },
      select: {
        id: true,
        name: true,
        content: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
      }
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { Subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { name, content, description, isPublic } = requestBody;

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    // Find the prompt
    const existingPrompt = await prisma.prompt.findFirst({
      where: { 
        OR: [
          { slug: id, userId: user.id },
          { id: id, userId: user.id }
        ]
      },
      include: { Version: true }
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check if content has changed - if so, create new version
    const contentChanged = existingPrompt.content !== content;
    
    if (contentChanged) {
      const isPro = user.Subscription?.status === 'ACTIVE' || user.planType === 'PRO';
      
      // FREE users: 3 versions per prompt max
      if (!isPro && existingPrompt.Version.length >= (user.maxVersionsPerPrompt || 3)) {
        return NextResponse.json({ 
          error: `Free users can create up to ${user.maxVersionsPerPrompt || 3} versions per prompt. Upgrade to PRO for unlimited versions.`,
          code: 'VERSION_LIMIT_REACHED',
          upgradeRequired: true
        }, { status: 402 });
      }

      // Create new version
      await prisma.version.create({
        data: {
          content,
          userId: user.id,
          promptId: existingPrompt.id
        }
      });

      // Update user's version usage
      await prisma.user.update({
        where: { id: user.id },
        data: { versionsUsed: { increment: 1 } }
      });
    }

    // Update the prompt
    const updatedPrompt = await prisma.prompt.update({
      where: { id: existingPrompt.id },
      data: {
        name,
        content,
        description: description || '',
        isPublic: isPublic ?? existingPrompt.isPublic,
      }
    });

    return NextResponse.json({
      ...updatedPrompt,
      versionCreated: contentChanged
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
