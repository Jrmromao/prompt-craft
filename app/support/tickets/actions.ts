'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function getTicket(ticketId: string) {
  try {
    console.log('Fetching ticket:', ticketId); // Debug log
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    console.log('Found ticket:', ticket); // Debug log
    return ticket;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw new Error('Failed to fetch ticket');
  }
}

export async function addTicketComment(ticketId: string, content: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('Not authenticated');
    }

    // Get the user from the database using the Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const message = await prisma.message.create({
      data: {
        content,
        ticket: {
          connect: { id: ticketId },
        },
        user: {
          connect: { id: user.id },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/support/tickets/${ticketId}`);
    return message;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
}
