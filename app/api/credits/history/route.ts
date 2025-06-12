import { UserService } from '@/lib/services/userService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Route handler
export const GET = withDynamicRoute(
  async (req: Request) => {
    try {
      const userService = UserService.getInstance();
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const creditHistory = await userService.getCreditHistory(clerkUser.id);
      
      return NextResponse.json(creditHistory);
    } catch (error) {
      console.error('Error fetching credit history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch credit history' },
        { status: 500 }
      );
    }
  },
  [] // Empty array as fallback data
);
