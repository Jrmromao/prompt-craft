import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source } = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json(
          { success: false, message: 'Already subscribed' },
          { status: 400 }
        );
      }

      // Resubscribe
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          subscribed: true,
          confirmedAt: new Date(),
          unsubscribedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Resubscribed successfully',
      });
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name,
        source: source || 'blog',
        subscribed: true,
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
