import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Constants for view tracking
const VIEW_TRACKING_WINDOW_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Add required exports for Next.js 15.3.3
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = getAuth(request);
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Check if this is a unique view
    const existingView = await prisma.promptView.findFirst({
      where: {
        promptId: context.params.id,
        OR: [
          { userId: userId || undefined },
          { ipAddress: ipAddress || undefined }
        ],
        createdAt: {
          gte: new Date(Date.now() - VIEW_TRACKING_WINDOW_DAYS * MILLISECONDS_PER_DAY)
        }
      }
    });

    // If it's not a unique view, just return success
    if (existingView) {
      return new NextResponse('View already tracked', { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      // Create view record
      await tx.promptView.create({
        data: {
          promptId: context.params.id,
          userId: userId || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      // Update prompt view count
      await tx.prompt.update({
        where: { id: context.params.id },
        data: {
          viewCount: {
            increment: 1,
          },
          lastViewedAt: new Date(),
        },
      });
    });

    return new NextResponse('View tracked', { status: 200 });
  } catch (error) {
    console.error('Error tracking view:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 