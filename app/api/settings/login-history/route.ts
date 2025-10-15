import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { AuditAction } from '@/app/constants/audit';
import { AuditService } from '@/lib/services/auditService';
import { redis } from '@/lib/redis';
import { UserService } from '@/lib/services/UserService';

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

// redis imported from @/lib/redis
const USER_CACHE_TTL = 600; // 10 minutes

interface CachedUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  role: string;
  planType: string;
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock data since Clerk doesn't provide detailed session history
    const sessions = mockLoginHistory;

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        total: sessions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch login history' },
      { status: 500 }
    );
  }
}
