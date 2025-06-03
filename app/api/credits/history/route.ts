import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboardService';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const dashboardService = DashboardService.getInstance ? DashboardService.getInstance() : new DashboardService();
    const history = await dashboardService.getCreditHistory(userId);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 