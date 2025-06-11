import { NextRequest, NextResponse } from 'next/server';
import { withPlanLimits } from './planLimits';

type Handler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

export function withPlanLimitsMiddleware(handler: Handler, requiredFeature?: string) {
  return async (req: NextRequest, ...args: any[]) => {
    // Check plan limits first
    const planLimitResponse = await withPlanLimits(req, requiredFeature);
    if (planLimitResponse) {
      return planLimitResponse;
    }

    // If plan limits pass, continue with the original handler
    return handler(req, ...args);
  };
}

// Example usage:
/*
export const POST = withPlanLimitsMiddleware(
  async (req: NextRequest) => {
    // Your API route handler
  },
  'advanced_analytics' // Optional feature requirement
);
*/ 