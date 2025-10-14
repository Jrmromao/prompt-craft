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
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        Subscription: true,
        Prompt: { select: { id: true } }
      }
    });

    // Auto-create user if not found
    if (!user) {
      const { user: clerkUser } = await auth();
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
          name: clerkUser?.fullName || '',
          planType: 'FREE'
        },
        include: {
          Subscription: true,
          Prompt: { select: { id: true } }
        }
      });
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

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const uniqueSlug = `${baseSlug}-${timestamp}`;

    // Create prompt and initial version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const prompt = await tx.prompt.create({
        data: {
          name,
          content,
          description: description || '',
          isPublic: isPublic || false,
          userId: user.id, // Use database user ID, not Clerk ID
          slug: uniqueSlug,
        }
      });

      // Create initial version (version 1)
      const version = await tx.version.create({
        data: {
          content,
          userId: user.id,
          promptId: prompt.id
        }
      });

      // Update user's version usage
      await tx.user.update({
        where: { id: user.id },
        data: { versionsUsed: { increment: 1 } }
      });

      return { prompt, version };
    });

    return NextResponse.json({
      ...result.prompt,
      initialVersion: result.version
    });
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

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const prompts = await prisma.prompt.findMany({
      where: { userId: user.id },
      include: {
        Version: {
          select: { id: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { Version: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Add version count and latest version info
    const promptsWithVersionInfo = prompts.map(prompt => ({
      ...prompt,
      versionCount: prompt._count.Version,
      latestVersion: prompt.Version[0] || null
    }));

    return NextResponse.json(promptsWithVersionInfo);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
