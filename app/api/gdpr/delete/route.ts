import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GDPRService } from '@/lib/services/gdpr';

const gdprService = new GDPRService();

export async function POST() {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await gdprService.handleDeletionRequest(session.userId);
    
    return NextResponse.json({ 
      message: 'Deletion request received. You will receive an email confirmation shortly.' 
    });
  } catch (error) {
    console.error('Error processing deletion request:', error);
    return NextResponse.json(
      { error: 'Failed to process deletion request. Please try again later.' },
      { status: 500 }
    );
  }
} 