// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function testHandler() {
  return NextResponse.json({ message: 'API is working' });
}

// Define fallback data
const fallbackData = {
  message: 'API is working (build time)',
};

// Export the wrapped handler
export const GET = withDynamicRoute(testHandler, fallbackData);
