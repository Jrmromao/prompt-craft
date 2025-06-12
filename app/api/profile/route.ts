import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { userProfileSchema } from '@/lib/validations/user';
import { z } from 'zod';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';
import { trackUserFlowError, trackUserFlowEvent } from '@/lib/error-tracking';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    trackUserFlowEvent('profile_update', 'fetch_profile', { userId });

    const profile = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        planType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      trackUserFlowError('profile_update', new Error('Profile not found'), { userId });
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    trackUserFlowError('profile_update', error as Error);
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = userProfileSchema.parse(body);

    trackUserFlowEvent('profile_update', 'start_update', { userId, data: validatedData });

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name: validatedData.name,
        bio: validatedData.bio,
        jobTitle: validatedData.jobTitle,
        location: validatedData.location,
        company: validatedData.company,
        website: validatedData.website,
        twitter: validatedData.twitter,
        linkedin: validatedData.linkedin,
      },
    });

    trackUserFlowEvent('profile_update', 'update_success', { userId });
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      trackUserFlowError('profile_update', error, { validationErrors: error.errors });
      return new NextResponse('Invalid request data', { status: 400 });
    }
    trackUserFlowError('profile_update', error as Error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    trackUserFlowEvent('profile_delete', 'start_delete', { userId });

    await prisma.user.delete({
      where: { clerkId: userId },
    });

    trackUserFlowEvent('profile_delete', 'delete_success', { userId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    trackUserFlowError('profile_delete', error as Error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
