import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GDPRService } from '@/lib/services/gdpr';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const gdprService = new GDPRService();
    
    await gdprService.handleRectificationRequest(session.userId, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling rectification request:', error);
    return NextResponse.json(
      { error: 'Failed to process rectification request' },
      { status: 500 }
    );
  }
} 