import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: string;
  planType: string;
  monthlyCredits: number;
  purchasedCredits: number;
}

export async function requireAuth(): Promise<{ user: AuthUser; error?: never } | { user?: never; error: NextResponse }> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        error: NextResponse.json({
          success: false,
          error: 'Unauthorized'
        }, { status: 401 })
      };
    }

    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        planType: true,
        monthlyCredits: true,
        purchasedCredits: true,
      }
    });

    // Create user if doesn't exist (race condition handling)
    if (!user) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        
        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) {
          throw new Error('No email found');
        }

        const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: primaryEmail,
            name: fullName,
            role: 'USER',
            planType: 'FREE',
            monthlyCredits: 10,
            purchasedCredits: 0,
            creditCap: 10,
            lastCreditReset: new Date(),
          },
          select: {
            id: true,
            clerkId: true,
            email: true,
            name: true,
            role: true,
            planType: true,
            monthlyCredits: true,
            purchasedCredits: true,
          }
        });
      } catch (createError) {
        console.error('User creation failed:', createError);
        return {
          error: NextResponse.json({
            success: false,
            error: 'User creation failed'
          }, { status: 500 })
        };
      }
    }

    return { user: user as AuthUser };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      error: NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 500 })
    };
  }
}

export async function requireRole(roles: string[]): Promise<{ user: AuthUser; error?: never } | { user?: never; error: NextResponse }> {
  const authResult = await requireAuth();
  
  if (authResult.error) {
    return authResult;
  }

  if (!roles.includes(authResult.user.role)) {
    return {
      error: NextResponse.json({
        success: false,
        error: 'Forbidden'
      }, { status: 403 })
    };
  }

  return authResult;
}
