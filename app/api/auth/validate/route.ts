import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    return NextResponse.json({
      isAuthenticated: !!userId,
      userId: userId || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json({
      isAuthenticated: false,
      userId: null,
      error: 'Authentication check failed'
    }, { status: 500 });
  }
}
