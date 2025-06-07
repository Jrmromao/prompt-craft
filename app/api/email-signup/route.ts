import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Add route segment configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Email validation schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = emailSchema.parse(body);

    // Check if email already exists
    const existingSignup = await prisma.emailSignup.findUnique({
      where: { email },
    });

    if (existingSignup) {
      if (existingSignup.status === 'UNSUBSCRIBED') {
        // Reactivate unsubscribed email
        await prisma.emailSignup.update({
          where: { email },
          data: { status: 'PENDING' },
        });
        return NextResponse.json({ message: 'Welcome back! You have been re-subscribed.' });
      }
      return NextResponse.json(
        { message: 'You are already on our waitlist!' },
        { status: 200 }
      );
    }

    // Create new email signup
    await prisma.emailSignup.create({
      data: {
        email,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: 'Thank you for joining our waitlist! We will keep you updated.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.error('Error in email signup:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 