import { NextResponse } from 'next/server';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Your form listing logic here
    return NextResponse.json({ forms: [] });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    // Ensure request has content
    if (!request.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    // Add your form handling logic here

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FORMS_POST]', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
