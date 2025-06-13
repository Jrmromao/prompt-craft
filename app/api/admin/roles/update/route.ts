import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role, toPrismaRole } from '@/utils/roles';
import * as Sentry from '@sentry/nextjs';
import { requireRole } from '@/utils/roles.server';

export async function POST(req: Request) {
  try {
    // Ensure only SUPER_ADMIN can update roles
    const { userId, role: currentRole } = await requireRole(Role.SUPER_ADMIN);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId: targetUserId, role: newRole } = await req.json();

    // Validate input
    if (!targetUserId || !newRole || !Object.values(Role).includes(newRole)) {
      return new NextResponse('Invalid input', { status: 400 });
    }

    // Get the user's current role
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Update role in database
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: toPrismaRole(newRole) },
      select: { id: true, role: true },
    });

    // Log the role change
    await prisma.roleChangeLog.create({
      data: {
        userId: targetUserId,
        oldRole: user.role,
        newRole: toPrismaRole(newRole),
        changedBy: userId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error updating role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 