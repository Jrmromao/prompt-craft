import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

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

    return new NextResponse('Password updated successfully', { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
