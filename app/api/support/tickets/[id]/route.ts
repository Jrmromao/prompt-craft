import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SupportService } from '@/lib/services/supportService';
import { z } from 'zod';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

const replySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
  isInternal: z.boolean().optional(),
});

// Define the main handler
async function ticketDetailHandler(request: Request, context?: { params?: Record<string, string> }) {
  const ticketId = context?.params?.id || '';

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supportService = SupportService.getInstance();
  const ticket = await supportService.getTicket(ticketId, userId);

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  return NextResponse.json(ticket);
}

// Define fallback data
const fallbackData = {
  id: '',
  title: '',
  description: '',
  status: 'OPEN',
  category: 'GENERAL_INQUIRY',
  priority: 'MEDIUM',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  replies: [],
};

// Export the wrapped handler
export const GET = withDynamicRoute(ticketDetailHandler, fallbackData);

export async function POST(
  request: Request,
  // @ts-ignore
  { params }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = replySchema.parse(body);

    const supportService = SupportService.getInstance();
    const message = await supportService.addMessage(params.id, userId, validatedData.content);

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  // @ts-ignore
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

    const supportService = SupportService.getInstance();
    const ticket = await supportService.updateTicketStatus(params.id, userId, status);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
