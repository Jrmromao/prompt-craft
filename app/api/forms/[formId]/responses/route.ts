// app/api/forms/[formId]/responses/route.ts
import { NextResponse } from 'next/server';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function formResponsesHandler(request: Request) {
  try {
    // Add your form responses handling logic here
    return NextResponse.json({ responses: [] });
  } catch (error) {
    console.error('[FORM_RESPONSES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const GET = withDynamicRoute(formResponsesHandler, fallbackData);
