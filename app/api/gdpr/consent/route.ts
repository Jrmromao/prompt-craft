import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GDPRService } from '@/lib/services/gdpr';

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

    const { purpose, granted } = await request.json();
    const headers = request.headers;
    
    await gdprService.recordConsent(
      session.userId,
      purpose,
      granted,
      {
        ipAddress: headers.get('x-forwarded-for') || undefined,
        userAgent: headers.get('user-agent') || undefined,
      }
    );
    
    return NextResponse.json({ 
      message: 'Consent recorded successfully. You will receive an email confirmation shortly.' 
    });
  } catch (error) {
    console.error('Error recording consent:', error);
    return NextResponse.json(
      { error: 'Failed to record consent. Please try again later.' },
      { status: 500 }
    );
  }
} 