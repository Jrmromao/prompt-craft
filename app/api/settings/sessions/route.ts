import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { AuditAction } from '@/app/constants/audit';
import { logAudit } from '@/app/lib/auditLogger';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const sessions = await (clerkClient as any).users.getSessions(userId);

    await logAudit({
      action: AuditAction.GET_SESSIONS,
      userId,
      resource: 'sessions',
      status: 'success',
      details: { sessions },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Session fetch error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return new NextResponse('Session ID is required', { status: 400 });
    }

    await logAudit({
      action: AuditAction.DELETE_SESSION,
      userId,
      resource: 'sessions',
      status: 'success',
      details: { sessionId },
    });
    // Revoke the session
    await (clerkClient as any).users.revokeSession(sessionId);

    return new NextResponse('Session revoked successfully', { status: 200 });
  } catch (error) {
    console.error('Error revoking session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
