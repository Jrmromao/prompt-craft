import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SupportService } from '@/lib/services/supportService';
import { z } from 'zod';
import { TicketStatus } from '@prisma/client';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const replySchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

// GET: Get ticket details
export async function GET(request: Request, context: any) {
  const ticketId = context?.params?.id;
  if (!ticketId) {
    return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supportService = SupportService.getInstance();
  const ticket = await supportService.getTicket(ticketId);

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  return NextResponse.json(ticket);
}

// POST: Add reply to ticket
export async function POST(request: Request, context: any) {
  try {
    const ticketId = context?.params?.id;
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = replySchema.parse(body);

    const supportService = SupportService.getInstance();
    const message = await supportService.addMessage(ticketId, userId, validatedData.content);

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update ticket status
export async function PATCH(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses: readonly TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status as TicketStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const ticketStatus = status as TicketStatus;
    const ticketId = context?.params?.id;
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }
    const supportService = SupportService.getInstance();
    const ticket = await supportService.updateTicketStatus(ticketId, ticketStatus, userId);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
