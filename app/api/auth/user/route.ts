import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    // Get user from database - this is the source of truth
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
        createdAt: true,
        updatedAt: true
      }
    });

    // If user doesn't exist in database, create from Clerk data
    if (!user) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        
        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) {
          throw new Error('No email found in Clerk user');
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
            createdAt: true,
            updatedAt: true
          }
        });

        // Update Clerk metadata
        await client.users.updateUserMetadata(userId, {
          privateMetadata: {
            databaseId: user.id,
            planType: user.planType,
          }
        });
      } catch (createError) {
        console.error('Failed to create user from Clerk data:', createError);
        return NextResponse.json({
          success: false,
          error: 'User creation failed'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          id: user.clerkId,
          databaseId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          planType: user.planType,
          credits: {
            monthly: user.monthlyCredits,
            purchased: user.purchasedCredits,
            total: user.monthlyCredits + user.purchasedCredits
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Auth user API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication check failed'
    }, { status: 500 });
  }
}
