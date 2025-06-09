// app/api/forms/[formId]/responses/route.ts
import { NextResponse } from 'next/server';

// Configure route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  try {
    // Add your form responses handling logic here
    return NextResponse.json({ responses: [] });
  } catch (error) {
    console.error('[FORM_RESPONSES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
