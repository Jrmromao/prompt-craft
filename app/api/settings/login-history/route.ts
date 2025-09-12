import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { AuditAction } from '@/app/constants/audit';
import { AuditService } from '@/lib/services/auditService';
import { Redis } from '@upstash/redis';
import { UserService } from '@/lib/services/userService';

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

const redis = Redis.fromEnv();
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
    
    // Ensure user exists in the database before logging, with Redis cache
    const userCacheKey = `user:${userId}`;
    let user: CachedUser | null = null;

    user = await redis.get(userCacheKey);

    if (!user) {
      const dbUser = await import('@/lib/prisma').then(m => m.prisma.user.findUnique({ 
        where: { clerkId: userId }, 
        select: { id: true, name: true, email: true, imageUrl: true, role: true, planType: true } 
      }));
      
      if (!dbUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      user = {
        id: dbUser.id,
        name: dbUser.name || '',
        email: dbUser.email,
        imageUrl: dbUser.imageUrl || undefined,
        role: dbUser.role,
        planType: dbUser.planType,
      };

      await redis.setex(userCacheKey, USER_CACHE_TTL, JSON.stringify(user));
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
        console.log('User not found in database for clerkId:', userId);
        return new NextResponse('User not found in database', { status: 404 });
      }
      // Normalize null fields to empty string for type safety
      user = {
        id: dbUser.id,
        name: dbUser.name ?? '',
        email: dbUser.email,
        imageUrl: dbUser.imageUrl ?? undefined,
        role: dbUser.role,
        planType: dbUser.planType,
      };
      await redis.set(userCacheKey, JSON.stringify(user), { ex: USER_CACHE_TTL });
      console.log('User cached in Redis:', user);
    } else {
      user = typeof user === 'string' ? JSON.parse(user) : user;
      user = user as CachedUser;
      console.log('Parsed user from Redis:', user);
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

    const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);
    if (!userDatabaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    
    await AuditService.getInstance().logAudit({
      action: AuditAction.GET_LOGIN_HISTORY,
      userId: userDatabaseId, // Use DB id for audit log
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
