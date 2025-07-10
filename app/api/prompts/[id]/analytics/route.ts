import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { AnalyticsTrackingService } from '@/lib/services/analyticsTrackingService';
import { PromptService } from '@/lib/services/promptService';
import { prisma } from '@/lib/prisma';
import { UserService } from '@/lib/services/userService';

// Use environment variable for API base URL, fallback to localhost
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Track the view
    const analyticsTrackingService = AnalyticsTrackingService.getInstance();
    const params = await context.params;
    await analyticsTrackingService.trackPromptView(params.id, userId ?? undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking prompt view:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}


export async function GET(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const promptId = params.id;
    
    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Get the user's database ID
    const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);
    if (!userDatabaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get analytics data
    const analytics = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: {
        copyCount: true,
        viewCount: true,
        usageCount: true,
        upvotes: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true,
            versions: true
          }
        }
      }
    });

    if (!analytics) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.promptAnalytics.findMany({
      where: {
        promptId: promptId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      ...analytics,
      dailyStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
