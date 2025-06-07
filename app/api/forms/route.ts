import { NextResponse } from 'next/server';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

export async function GET() {
  try {
    // Your form listing logic here
    return NextResponse.json({ forms: [] });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

// Define the main handler
async function formsHandler(request: Request) {
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

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const POST = withDynamicRoute(formsHandler, fallbackData);
