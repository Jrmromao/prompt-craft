import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Constants for view tracking
const VIEW_TRACKING_WINDOW_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Add required exports for Next.js 15.3.3
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest, context: any) {
  try {
    let params = context.params;
    if (typeof params.then === 'function') {
      params = await params;
    }
    const { userId } = await auth();
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || undefined;

    const existingView = await prisma.promptView.findFirst({
      where: {
        promptId: params.id,
        OR: [
          { userId: userId || undefined },
          { ipAddress: ipAddress || undefined }
        ],
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60) // Last hour
        }
      }
    });

    if (!existingView) {
      await prisma.$transaction(async (tx) => {
        // Create new view record
        await tx.promptView.create({
          data: {
            promptId: params.id,
            userId: userId || undefined,
            ipAddress: ipAddress || undefined,
            userAgent: headersList.get('user-agent') || undefined
          }
        });

        // Update prompt view count
        await tx.prompt.update({
          where: { id: params.id },
          data: {
            viewCount: { increment: 1 },
            lastViewedAt: new Date()
          }
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
} 