import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { userProfileSchema } from '@/lib/validations/user';
import { z } from 'zod';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = userProfileSchema.parse(body);

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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
} 