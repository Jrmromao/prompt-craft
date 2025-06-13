import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/utils/roles.server';
import { Role } from '@/utils/roles';
import { AuditAction } from '@/app/constants/audit';
import { logAudit } from '@/app/lib/auditLogger';


export async function GET() {
  try {
    // Ensure only SUPER_ADMIN can view role history
    const { userId } = await requireRole(Role.SUPER_ADMIN);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const roleChanges = await prisma.roleChangeLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 changes
    });

    await logAudit({
      action: AuditAction.GET_ROLE_HISTORY,
      userId,
      resource: 'role-history',
      status: 'success',
      details: { roleChanges },
    });
    return NextResponse.json(roleChanges);
  } catch (error) {
    console.error('Error fetching role changes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 