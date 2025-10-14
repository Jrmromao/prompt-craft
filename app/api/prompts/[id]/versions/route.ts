import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    const prompt = await prisma.prompt.findFirst({
      where: { 
        OR: [
          { slug: id, userId: user.id },
          { id: id, userId: user.id }
        ]
      },
      include: { Version: { orderBy: { createdAt: 'desc' } } }
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const isPro = user.Subscription?.status === 'ACTIVE' || user.planType === 'PRO';
    
    // FREE users: 3 versions per prompt max
    if (!isPro && prompt.Version.length >= (user.maxVersionsPerPrompt || 3)) {
      return NextResponse.json({ 
        error: `Free users can create up to ${user.maxVersionsPerPrompt || 3} versions per prompt. Upgrade to PRO for unlimited versions.`,
        code: 'VERSION_LIMIT_REACHED',
        upgradeRequired: true
      }, { status: 402 });
    }

    const { content, description } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if content is different from latest version
    const latestVersion = prompt.Version[0];
    if (latestVersion && latestVersion.content === content) {
      return NextResponse.json({ 
        error: 'Content is identical to the latest version',
        code: 'NO_CHANGES'
      }, { status: 400 });
    }

    const version = await prisma.version.create({
      data: {
        content,
        userId: user.id,
        promptId: prompt.id
      }
    });

    // Update the main prompt content to match latest version
    await prisma.prompt.update({
      where: { id: prompt.id },
      data: { content }
    });

    // Update user's version usage
    await prisma.user.update({
      where: { id: user.id },
      data: { versionsUsed: { increment: 1 } }
    });

    return NextResponse.json({
      ...version,
      versionNumber: prompt.Version.length + 1
    });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    const prompt = await prisma.prompt.findFirst({
      where: { 
        OR: [
          { slug: id, userId: user.id },
          { id: id, userId: user.id }
        ]
      }
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const versions = await prisma.version.findMany({
      where: { promptId: prompt.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Add version numbers (latest = highest number)
    const versionsWithNumbers = versions.map((version, index) => ({
      ...version,
      versionNumber: versions.length - index
    }));

    return NextResponse.json(versionsWithNumbers);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
