import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GDPRService } from '@/lib/services/GDPRService';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, '24 h'), // 1 deletion request per day
});

const deletionSchema = z.object({
  confirmationText: z.string().refine(
    (text) => text === 'DELETE MY ACCOUNT',
    'Must type "DELETE MY ACCOUNT" to confirm'
  ),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for deletion requests
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Deletion request already submitted today' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validationResult = deletionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid confirmation', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const gdprService = GDPRService.getInstance();
    
    // Schedule deletion for 30 days from now (GDPR compliance)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    
    await gdprService.scheduleDataDeletion(userId, deletionDate);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Account deletion scheduled',
        scheduledDeletion: deletionDate.toISOString(),
        note: 'Your account will be permanently deleted in 30 days. Contact support to cancel this request.',
      },
    });
  } catch (error) {
    console.error('Error scheduling account deletion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule account deletion' },
      { status: 500 }
    );
  }
}
