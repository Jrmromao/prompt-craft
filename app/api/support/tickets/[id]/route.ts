import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SupportService } from '@/lib/services/supportService';
import { z } from 'zod';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';
import { TicketStatus } from '@prisma/client';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

const replySchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

// Define the main handler
async function ticketDetailHandler(
  request: Request,
  context?: { params?: Record<string, string> }
) {
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

// Define the POST handler
async function addReplyHandler(request: Request, context?: { params?: Record<string, string> }) {
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

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handlers
export const GET = withDynamicRoute(ticketDetailHandler, fallbackData);
export const POST = withDynamicRoute(addReplyHandler, fallbackData);

export async function PATCH(
  request: Request,
  // @ts-expect-error params is typed as any
  { params }
) {
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
    const supportService = SupportService.getInstance();
    const ticket = await supportService.updateTicketStatus(params.id, ticketStatus, userId);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
