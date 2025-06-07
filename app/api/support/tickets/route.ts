import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SupportService } from '@/lib/services/supportService';
import { z } from 'zod';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['BUG', 'FEATURE_REQUEST', 'GENERAL_INQUIRY', 'TECHNICAL_SUPPORT', 'BILLING']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

// Define the main handler
async function ticketsHandler(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');

  const supportService = SupportService.getInstance();
  const tickets = await supportService.getTickets(userId, {
    status: status as any,
    category: category as any,
    priority: priority as any,
  });

  return NextResponse.json(tickets);
}

// Define the POST handler
async function createTicketHandler(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ticketSchema.parse(body);

    const supportService = SupportService.getInstance();
    const ticket = await supportService.createTicket(userId, validatedData);

    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handlers
export const GET = withDynamicRoute(ticketsHandler, fallbackData);
export const POST = withDynamicRoute(createTicketHandler, fallbackData);
