import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
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
        createdAt: true,
        updatedAt: true
      }
    });

    // If user doesn't exist, try to find by email and update, or create new
    if (!user) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        
        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) {
          throw new Error('No email found in Clerk user');
        }

        const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

        // Try to find existing user by email and update their clerkId
        const existingUser = await prisma.user.findUnique({
          where: { email: primaryEmail }
        });

        if (existingUser) {
          // Update existing user with new clerkId
          user = await prisma.user.update({
            where: { email: primaryEmail },
            data: {
              clerkId: userId,
              name: fullName,
              updatedAt: new Date(),
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
          console.log('✅ Updated existing user with new Clerk ID:', user.clerkId);
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              clerkId: userId,
              email: primaryEmail,
              name: fullName,
              role: 'USER',
              planType: 'FREE',
              monthlyCredits: 100,
              purchasedCredits: 0,
              updatedAt: new Date(),
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
          console.log('✅ Created new user:', user.clerkId);
        }
      } catch (createError) {
        console.error('❌ Failed to create/update user:', createError);
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
    console.error('❌ Auth API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication check failed'
    }, { status: 500 });
  }
}
