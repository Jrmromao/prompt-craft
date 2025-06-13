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

    const userData = await gdprService.exportUserData(session.userId);
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
} 