import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { AuditAction } from '@/app/constants/audit';
import { logAudit } from '@/app/lib/auditLogger';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Session {
  id: string;
  deviceType?: string;
  browserName?: string;
  location?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
}

const mockLoginHistory: Session[] = [
  {
    id: 'mock-session-1',
    deviceType: 'Desktop',
    browserName: 'Chrome',
    location: 'Lisbon, Portugal',
    ipAddress: '192.168.1.1',
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-session-2',
    deviceType: 'Mobile',
    browserName: 'Safari',
    location: 'Porto, Portugal',
    ipAddress: '192.168.1.2',
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Get user's sessions
    const client = await clerkClient();
    const sessionsResponse = await client.sessions.getSessionList({ userId });
    const sessions = sessionsResponse.data;
    // Format session data
    const loginHistory = sessions.map((session: any) => ({
      id: session.id,
      device: session.deviceType || 'Unknown',
      browser: session.browserName || 'Unknown',
      location: session.lastActiveAt ? session.lastActiveAt.location : 'Unknown',
      ipAddress: session.lastActiveAt ? session.lastActiveAt.ipAddress : 'Unknown',
      lastActive: session.lastActiveAt,
      createdAt: session.createdAt,
    }));
    
    await logAudit({
      action: AuditAction.GET_LOGIN_HISTORY,
      userId,
      resource: 'login-history',
      status: 'success',
      details: { loginHistory },
    });
    return NextResponse.json(loginHistory);
  } catch (error) {
    // If Clerk fails, fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(mockLoginHistory);
    }
    console.error('Error fetching login history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
