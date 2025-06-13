import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GDPRService } from '@/lib/services/gdpr';

const gdprService = new GDPRService();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    await gdprService.handleRectificationRequest(session.userId, data);
    
    return NextResponse.json({ 
      message: 'Data rectification request received. You will receive an email confirmation shortly.' 
    });
  } catch (error) {
    console.error('Error handling rectification request:', error);
    return NextResponse.json(
      { error: 'Failed to process rectification request. Please try again later.' },
      { status: 500 }
    );
  }
} 