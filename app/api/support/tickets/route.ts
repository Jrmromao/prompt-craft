import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SupportService } from '@/lib/services/supportService';
import { z } from 'zod';
import { Category, Priority, TicketStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Export dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().optional(),
});

// Add CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// GET: List support tickets
export async function GET(request: Request, context: any) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    // Create filters object only with valid values
    const filters: {
      status?: TicketStatus;
      category?: Category;
      priority?: Priority;
    } = {};

    if (status && Object.values(TicketStatus).includes(status as TicketStatus)) {
      filters.status = status as TicketStatus;
    }
    if (category && Object.values(Category).includes(category as Category)) {
      filters.category = category as Category;
    }
    if (priority && Object.values(Priority).includes(priority as Priority)) {
      filters.priority = priority as Priority;
    }

    const supportService = SupportService.getInstance();
    const tickets = await supportService.getTickets(clerkId, filters);

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    if (error instanceof Error && error.message === 'User not found in database') {
      return NextResponse.json(
        { error: 'User account not found. Please contact support.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log('API: Support ticket creation request received');

  try {
    const session = await auth();
    const userId = session.userId;
    console.log('API: Auth check - User ID:', userId);

    if (!userId) {
      console.error('API: Authentication failed - No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('API: Request body received:', { ...body, userId: undefined });

    // Validate request body
    const validationResult = ticketSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('API: Validation failed:', validationResult.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Get DB user ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      console.error('API: User not found in database:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('API: Creating ticket for user:', dbUser.id);

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority || 'MEDIUM',
        userId: dbUser.id,
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    console.log('API: Ticket created successfully:', { ticketId: ticket.id });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error(
      'API: Error creating ticket:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
