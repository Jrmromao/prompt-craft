import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { UserService } from '@/lib/services/userService';
import { NextResponse } from 'next/server';

// Types for Clerk metadata
type PrivateMetadata = {
  databaseId?: string;
};

type PublicMetadata = {
  role?: string;
};

/**
 * Get the user's database ID from Clerk's private metadata
 * This can be used in both client and server components
 */
export async function getDatabaseId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session.sessionClaims) return null;

    const privateMetadata = session.sessionClaims.privateMetadata as PrivateMetadata;
    return privateMetadata?.databaseId || null;
  } catch (error) {
    console.error('Error getting database ID:', error);
    return null;
  }
}

/**
 * Get the user's database ID from request headers
 * This should only be used in API routes and server components
 */
export async function getDatabaseIdFromHeaders(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get('x-database-user-id');
  } catch (error) {
    console.error('Error getting database ID from headers:', error);
    return null;
  }
}

/**
 * Get the user's role from Clerk's public metadata
 */
export async function getUserRole(): Promise<string> {
  try {
    const session = await auth();
    if (!session.sessionClaims) return 'USER';

    const publicMetadata = session.sessionClaims.publicMetadata as PublicMetadata;
    return publicMetadata?.role || 'USER';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'USER';
  }
}

/**
 * Check if the user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Check if the user has admin privileges
 */
export async function isAdmin(): Promise<boolean> {
  const userRole = await getUserRole();
  return ['ADMIN', 'SUPER_ADMIN'].includes(userRole);
}

/**
 * Get the current database user
 */
export async function getCurrentDatabaseUser() {
  const databaseId = await getDatabaseId();
  if (!databaseId) return null;

  // Add your database query here to get the user
  // Example:
  // return await prisma.user.findUnique({
  //   where: { id: databaseId }
  // });
  return null;
}

export async function getDatabaseIdFromClerk(clerkId: string) {
  if (!clerkId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const userDatabaseId = await UserService.getInstance().getDatabaseIdFromClerk(clerkId);
  if (!userDatabaseId) {
    return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
  }

  return { userDatabaseId };
} 