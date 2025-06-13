import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GDPRService } from '@/lib/services/gdpr';
import { User } from '@prisma/client';

const gdprService = new GDPRService();

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await gdprService.handleRectificationRequest(session.userId, data as Partial<User>);
    
    return NextResponse.json({ message: 'Rectification request received' });
  } catch (error) {
    console.error('Error processing rectification request:', error);
    return NextResponse.json(
      { error: 'Failed to process rectification request' },
      { status: 500 }
    );
  }
} 