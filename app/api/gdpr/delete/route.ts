import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DeletionService } from '@/lib/services/deletionService';
import { logger } from '@/lib/utils/logger';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reason } = await req.json();
    const deletionService = DeletionService.getInstance();

    // Start the deletion process
    await deletionService.handleDeletion(session.userId, reason);

    return NextResponse.json(
      { message: 'Deletion request received. Your data will be permanently deleted after 30 days.' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to process deletion request', { error });
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    );
  }
}

// Admin endpoint to recover an account
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    const { targetUserId } = await req.json();
    const deletionService = DeletionService.getInstance();

    await deletionService.recoverAccount(targetUserId);
    
    return NextResponse.json(
      { message: 'Account recovered successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to recover account', { error });
    return NextResponse.json(
      { error: 'Failed to recover account' },
      { status: 500 }
    );
  }
} 