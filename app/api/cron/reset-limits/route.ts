import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { logAudit } from '@/app/lib/auditLogger';
import { AuditAction } from '@/app/constants/audit';

// This route should be called by a cron job at the beginning of each month
export async function POST(req: Request) {
  try {
    // Verify the request is from a trusted source (e.g., Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all free users
    const freeUsers = await prisma.user.findMany({
      where: {
        planType: PlanType.FREE
      },
      select: {
        id: true
      }
    });

    // Log the reset for each user
    const auditLogs = freeUsers.map(user => 
      logAudit({
        userId: user.id,
        action: AuditAction.MONTHLY_LIMIT_RESET,
        resource: 'prompts',
        details: {
          type: 'private_prompt_limit',
          oldValue: 3, // Previous month's limit
          newValue: 0  // Reset to 0 for the new month
        }
      })
    );

    await Promise.all(auditLogs);

    return NextResponse.json({
      success: true,
      message: `Reset monthly limits for ${freeUsers.length} free users`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting monthly limits:', error);
    return NextResponse.json(
      { error: 'Failed to reset monthly limits' },
      { status: 500 }
    );
  }
} 