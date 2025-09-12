import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserService } from '@/lib/services/UserService';

// Route configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest, context: any) {
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

    // Update the copy count
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        copyCount: {
          increment: 1
        }
      },
      select: {
        copyCount: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      copyCount: updatedPrompt.copyCount 
    });
  } catch (error) {
    console.error('Error tracking prompt copy:', error);
    return NextResponse.json(
      { error: 'Failed to track prompt copy' },
      { status: 500 }
    );
  }
}
