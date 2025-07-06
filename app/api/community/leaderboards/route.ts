import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    // Get top creators (users with most upvotes on their prompts)
    const topCreators = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        imageUrl: true,
        prompts: {
          select: {
            upvotes: true,
          },
          where: {
            isPublic: true,
          },
        },
      },
      take: 10,
    });

    const topCreatorsWithStats = topCreators
      .map(user => ({
        id: user.id,
        name: user.displayName || user.name || 'Anonymous',
        imageUrl: user.imageUrl,
        totalUpvotes: user.prompts.reduce((sum: number, prompt: any) => sum + prompt.upvotes, 0),
        promptCount: user.prompts.length,
      }))
      .filter(user => user.totalUpvotes > 0)
      .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
      .slice(0, 5);

    // Get top voters (users who have cast the most votes)
    const topVoters = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        imageUrl: true,
        votes: {
          select: {
            id: true,
          },
        },
      },
      take: 10,
    });

    const topVotersWithStats = topVoters
      .map(user => ({
        id: user.id,
        name: user.displayName || user.name || 'Anonymous',
        imageUrl: user.imageUrl,
        totalVotes: user.votes.length,
      }))
      .filter(user => user.totalVotes > 0)
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 5);

    // Get trending prompts (most upvotes in the last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const trendingPrompts = await prisma.prompt.findMany({
      where: {
        isPublic: true,
        votes: {
          some: {
            createdAt: {
              gte: oneWeekAgo,
            },
            value: 1, // Only upvotes
          },
        },
      },
      select: {
        id: true,
        name: true,
        upvotes: true,
        votes: {
          where: {
            createdAt: {
              gte: oneWeekAgo,
            },
            value: 1,
          },
          select: {
            id: true,
          },
        },
      },
      take: 10,
    });

    const trendingPromptsWithStats = trendingPrompts
      .map(prompt => ({
        id: prompt.id,
        name: prompt.name,
        totalUpvotes: prompt.upvotes,
        weeklyUpvotes: prompt.votes.length,
      }))
      .sort((a, b) => b.weeklyUpvotes - a.weeklyUpvotes)
      .slice(0, 5);

    // Get top credit earners (simplified - just use empty array for now since VoteReward table might be empty)
    let topCreditEarnersWithStats: any[] = [];
    
    try {
      // Check if VoteReward table has any data first
      const voteRewardCount = await prisma.voteReward.count();
      
      if (voteRewardCount > 0) {
        const topCreditEarners = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            displayName: true,
            imageUrl: true,
            voteRewardsReceived: {
              select: {
                creditsAwarded: true,
              },
            },
          },
          take: 20,
        });
        
        topCreditEarnersWithStats = topCreditEarners
          .map(user => ({
            id: user.id,
            name: user.displayName || user.name || 'Anonymous',
            imageUrl: user.imageUrl,
            creditsFromVotes: user.voteRewardsReceived.reduce((sum: number, reward: any) => sum + reward.creditsAwarded, 0),
            totalCreditsEarned: user.voteRewardsReceived.reduce((sum: number, reward: any) => sum + reward.creditsAwarded, 0),
          }))
          .filter(user => user.creditsFromVotes > 0)
          .sort((a, b) => b.creditsFromVotes - a.creditsFromVotes)
          .slice(0, 5);
      }
    } catch (creditError) {
      // Silently handle credit earners query failure
      topCreditEarnersWithStats = [];
    }

    // Get user stats (if authenticated) - simplified version
    let userStats = null;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: {
          id: true,
          prompts: {
            select: {
              upvotes: true,
            },
            where: {
              isPublic: true,
            },
          },
          votes: {
            select: {
              id: true,
            },
          },
        },
      });

      if (user) {
        userStats = {
          creditsEarned: 0, // Skip for now
          votesCast: user.votes.length,
          promptsCreated: user.prompts.length,
          totalUpvotes: user.prompts.reduce((sum: number, prompt: any) => sum + prompt.upvotes, 0),
        };
      }
    }

    return NextResponse.json({
      topCreators: topCreatorsWithStats,
      topVoters: topVotersWithStats,
      trendingPrompts: trendingPromptsWithStats,
      topCreditEarners: topCreditEarnersWithStats,
      userStats,
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 