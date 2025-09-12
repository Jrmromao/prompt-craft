import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { AuditAction } from '@/app/constants/audit';
import { AuditService } from '@/lib/services/auditService';
import { UserService } from '@/lib/services/UserService';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 attempts per hour
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
});

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Too many password change attempts' },
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const validationResult = passwordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

   
    if (!currentPassword || !newPassword) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verify current password
    try {
      await (clerkClient as any).users.verifyPassword({
        userId,
        password: currentPassword,
      });
    } catch (error) {
      return new NextResponse('Current password is incorrect', { status: 400 });
    }

    // Update password
    await (clerkClient as any).users.updateUserPassword({
      userId,
      newPassword: newPassword,
    });

    // get user databaseId from userService 
    const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(userId);
    if (!userDatabaseId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await AuditService.getInstance().logAudit({
      action: AuditAction.UPDATE_PASSWORD,
      userId: userDatabaseId,
      resource: 'password',
      status: 'success',
      details: { currentPassword, newPassword },
    });

    return new NextResponse('Password updated successfully', { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
