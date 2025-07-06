import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Starting leaderboards API...');
    const { userId } = await auth();
    console.log('User ID:', userId);

    // Test basic user query first
    console.log('Testing basic user query...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        imageUrl: true,
      },
      take: 5,
    });
    console.log('Users fetched:', users.length);

    // Return simplified response for now
    return NextResponse.json({
      topCreators: [],
      topVoters: [],
      trendingPrompts: [],
      topCreditEarners: [],
      userStats: null,
      debug: {
        usersCount: users.length,
        users: users,
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 