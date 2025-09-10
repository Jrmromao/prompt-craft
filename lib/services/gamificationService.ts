import { prisma } from '@/lib/prisma';
import { PlanType } from '@/utils/constants';

// Game Theory Constants
const LEVEL_EXPERIENCE_MULTIPLIER = 100;
const LEVEL_EXPERIENCE_BASE = 1000;

// Experience Points System
export const EXPERIENCE_REWARDS = {
  PROMPT_CREATED: 50,
  PROMPT_SHARED: 25,
  VOTE_CAST: 5,
  VOTE_RECEIVED: 10,
  COMMENT_POSTED: 15,
  COMMENT_RECEIVED: 8,
  ACHIEVEMENT_UNLOCKED: 100,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 25,
  CHALLENGE_COMPLETED: 200,
  PREMIUM_ACTION: 50,
} as const;

// Credit Rewards System (Game Theory: Variable Ratio Reinforcement)
export const CREDIT_REWARDS = {
  LEVEL_UP: {
    [PlanType.FREE]: 10,
    [PlanType.PRO]: 25,
  },
  ACHIEVEMENT_UNLOCK: {
    BRONZE: 5,
    SILVER: 15,
    GOLD: 30,
    PLATINUM: 60,
    DIAMOND: 120,
    LEGENDARY: 250,
  },
  STREAK_MILESTONE: {
    7: 20,    // Weekly streak
    30: 100,  // Monthly streak
    90: 300,  // Quarterly streak
    365: 1000, // Yearly streak
  },
  SEASONAL_REWARDS: {
    BRONZE: 50,
    SILVER: 150,
    GOLD: 400,
    PLATINUM: 800,
    DIAMOND: 1500,
    MASTER: 2500,
    GRANDMASTER: 5000,
  },
} as const;

// Premium Feature Multipliers
export const PREMIUM_MULTIPLIERS = {
  [PlanType.FREE]: 1.0,
  [PlanType.PRO]: 2.0,
} as const;

export interface LevelInfo {
  level: number;
  currentExp: number;
  expToNext: number;
  totalExpRequired: number;
  rewards: {
    credits: number;
    badges: string[];
    features: string[];
  };
}

export interface UserGameStats {
  level: number;
  experience: number;
  reputation: number;
  streak: number;
  longestStreak: number;
  totalCreditsEarned: number;
  achievements: number;
  badges: number;
  rank: number | null;
  tier: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rewards: {
    credits: number;
    experience: number;
    badges: string[];
  };
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  type: string;
  difficulty: string;
  progress: number;
  maxProgress: number;
  status: string;
  startDate: Date;
  endDate: Date;
  rewards: {
    credits: number;
    experience: number;
    badges: string[];
  };
  isPremium: boolean;
}

export class GamificationService {
  private static instance: GamificationService;

  private constructor() {}

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Experience and Level System
  calculateLevelFromExperience(totalExp: number): number {
    let level = 1;
    let expRequired = LEVEL_EXPERIENCE_BASE;
    
    while (totalExp >= expRequired) {
      totalExp -= expRequired;
      level++;
      expRequired = Math.floor(LEVEL_EXPERIENCE_BASE * Math.pow(LEVEL_EXPERIENCE_MULTIPLIER / 100, level - 1));
    }
    
    return level;
  }

  calculateExperienceForLevel(level: number): number {
    let totalExp = 0;
    for (let i = 1; i < level; i++) {
      totalExp += Math.floor(LEVEL_EXPERIENCE_BASE * Math.pow(LEVEL_EXPERIENCE_MULTIPLIER / 100, i - 1));
    }
    return totalExp;
  }

  getLevelInfo(currentExp: number): LevelInfo {
    const level = this.calculateLevelFromExperience(currentExp);
    const expForCurrentLevel = this.calculateExperienceForLevel(level);
    const expForNextLevel = this.calculateExperienceForLevel(level + 1);
    const expToNext = expForNextLevel - currentExp;
    
    return {
      level,
      currentExp: currentExp - expForCurrentLevel,
      expToNext,
      totalExpRequired: expForNextLevel - expForCurrentLevel,
      rewards: this.getLevelRewards(level),
    };
  }

  private getLevelRewards(level: number) {
    const rewards = {
      credits: 0,
      badges: [] as string[],
      features: [] as string[],
    };

    // Credits based on level milestones
    if (level % 5 === 0) rewards.credits += 50;
    if (level % 10 === 0) rewards.credits += 100;
    if (level % 25 === 0) rewards.credits += 500;

    // Badge rewards
    if (level >= 10) rewards.badges.push('Novice Creator');
    if (level >= 25) rewards.badges.push('Skilled Prompter');
    if (level >= 50) rewards.badges.push('Expert Creator');
    if (level >= 100) rewards.badges.push('Master Prompter');

    // Feature unlocks
    if (level >= 5) rewards.features.push('Custom Collections');
    if (level >= 15) rewards.features.push('Advanced Analytics');
    if (level >= 30) rewards.features.push('Priority Support');

    return rewards;
  }

  // Activity Tracking and Rewards
  async recordActivity(
    userId: string,
    action: keyof typeof EXPERIENCE_REWARDS,
    details?: any
  ): Promise<{ experience: number; creditsEarned: number; levelUp?: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        experience: true, 
        level: true, 
        planType: true, 
        streak: true,
        lastActivityDate: true 
      },
    });

    if (!user) throw new Error('User not found');

    const baseExp = EXPERIENCE_REWARDS[action];
    const multiplier = (PREMIUM_MULTIPLIERS as any)[user.planType] || 1.0;
    const experience = Math.floor(baseExp * multiplier);

    // Update streak if daily activity
    const today = new Date();
    const lastActivity = user.lastActivityDate;
    let streakBonus = 0;
    let newStreak = user.streak;

    if (action === 'DAILY_LOGIN' || action === 'PROMPT_CREATED' || action === 'VOTE_CAST') {
      if (!lastActivity || this.isDifferentDay(lastActivity, today)) {
        if (lastActivity && this.isConsecutiveDay(lastActivity, today)) {
          newStreak++;
        } else {
          newStreak = 1;
        }
        
        // Streak bonus experience
        if (newStreak >= 7) streakBonus = EXPERIENCE_REWARDS.STREAK_BONUS;
      }
    }

    const totalExp = experience + streakBonus;
    const newTotalExp = user.experience + totalExp;
    const oldLevel = user.level;
    const newLevel = this.calculateLevelFromExperience(newTotalExp);
    const levelUp = newLevel > oldLevel;

    // Calculate credits earned
    let creditsEarned = 0;
    if (levelUp) {
      creditsEarned += (CREDIT_REWARDS.LEVEL_UP as any)[user.planType] || 0;
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        experience: newTotalExp,
        totalExperience: newTotalExp,
        level: newLevel,
        streak: newStreak,
        lastActivityDate: today,
        totalCreditsEarned: { increment: creditsEarned },
        monthlyCredits: { increment: creditsEarned },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: action as any,
        details,
        points: totalExp,
        multiplier,
      },
    });

    // Check for achievements
    await this.checkAchievements(userId);

    return { experience: totalExp, creditsEarned, levelUp };
  }

  private isDifferentDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() !== date2.toDateString();
  }

  private isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  // Achievement System
  async checkAchievements(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userAchievements: true,
        prompts: true,
        votes: true,
        comments: true,
      },
    });

    if (!user) return [];

    const unlockedAchievements: string[] = [];
    const existingAchievements = new Set(user.userAchievements.map(ua => ua.achievementId));

    // Define achievement checks
    const achievementChecks = [
      {
        id: 'first-prompt',
        condition: user.prompts.length >= 1,
        name: 'First Steps',
        description: 'Create your first prompt',
      },
      {
        id: 'prompt-creator-5',
        condition: user.prompts.length >= 5,
        name: 'Getting Started',
        description: 'Create 5 prompts',
      },
      {
        id: 'prompt-creator-25',
        condition: user.prompts.length >= 25,
        name: 'Prolific Creator',
        description: 'Create 25 prompts',
      },
      {
        id: 'active-voter',
        condition: user.votes.length >= 10,
        name: 'Community Supporter',
        description: 'Cast 10 votes',
      },
      {
        id: 'social-butterfly',
        condition: user.comments.length >= 20,
        name: 'Social Butterfly',
        description: 'Post 20 comments',
      },
      {
        id: 'streak-master',
        condition: user.longestStreak >= 30,
        name: 'Streak Master',
        description: 'Maintain a 30-day streak',
      },
    ];

    for (const check of achievementChecks) {
      if (check.condition && !existingAchievements.has(check.id)) {
        await this.unlockAchievement(userId, check.id);
        unlockedAchievements.push(check.id);
      }
    }

    return unlockedAchievements;
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) return;

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    });

    // Award achievement rewards
    const rewards = achievement.rewards as any;
    if (rewards.credits) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          monthlyCredits: { increment: rewards.credits },
          totalCreditsEarned: { increment: rewards.credits },
        },
      });
    }

    if (rewards.experience) {
      await this.recordActivity(userId, 'ACHIEVEMENT_UNLOCKED');
    }
  }

  // User Statistics
  async getUserGameStats(userId: string): Promise<UserGameStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userAchievements: true,
        userBadges: true,
        seasonalStats: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) throw new Error('User not found');

    const currentSeason = user.seasonalStats[0];

    return {
      level: user.level,
      experience: user.experience,
      reputation: user.reputation,
      streak: user.streak,
      longestStreak: user.longestStreak,
      totalCreditsEarned: user.totalCreditsEarned,
      achievements: user.userAchievements.length,
      badges: user.userBadges.length,
      rank: currentSeason?.rank || null,
      tier: currentSeason?.tier || null,
    };
  }

  // Premium Features
  async hasAccessToFeature(userId: string, featureName: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, level: true },
    });

    if (!user) return false;

    const feature = await prisma.premiumFeature.findUnique({
      where: { name: featureName },
    });

    if (!feature || !feature.isActive) return false;

    // Check plan requirement
    const planHierarchy = [PlanType.FREE, PlanType.PRO];
    const userPlanIndex = planHierarchy.indexOf(user.planType as any);
    const requiredPlanIndex = planHierarchy.indexOf(feature.requiredTier as any);

    return userPlanIndex >= requiredPlanIndex;
  }

  // Challenge System
  async getActiveChallenges(userId: string): Promise<Challenge[]> {
    const now = new Date();
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        participations: {
          where: { userId },
        },
      },
    });

    return challenges.map(challenge => {
      const participation = challenge.participations[0];
      const progress = participation?.progress as any;
      
      return {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        icon: challenge.icon,
        category: challenge.category,
        type: challenge.type,
        difficulty: challenge.difficulty,
        progress: progress?.current || 0,
        maxProgress: progress?.target || 100,
        status: participation?.status || 'NOT_STARTED',
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        rewards: challenge.rewards as any,
        isPremium: challenge.isPremium,
      };
    });
  }

  // Leaderboards with Game Theory
  async getLeaderboard(
    type: 'experience' | 'reputation' | 'streak' | 'credits',
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
    limit: number = 10
  ) {
    const orderBy = {
      experience: { totalExperience: 'desc' as const },
      reputation: { reputation: 'desc' as const },
      streak: { longestStreak: 'desc' as const },
      credits: { totalCreditsEarned: 'desc' as const },
    };

    let where = {};
    if (timeframe !== 'all-time') {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'daily':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      where = { lastActiveAt: { gte: startDate } };
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        imageUrl: true,
        level: true,
        experience: true,
        reputation: true,
        streak: true,
        longestStreak: true,
        totalCreditsEarned: true,
        planType: true,
      },
      orderBy: orderBy[type],
      take: limit,
    });
  }

  // Social Features
  async createCollection(
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = false
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, level: true },
    });

    if (!user) throw new Error('User not found');

    // Check if user has access to collections
    const hasAccess = await this.hasAccessToFeature(userId, 'collections');
    if (!hasAccess && user.level < 5) {
      throw new Error('Collections require level 5 or premium plan');
    }

    return await prisma.userCollection.create({
      data: {
        userId,
        name,
        description,
        isPublic,
        isPremium: user.planType === PlanType.PRO,
      },
    });
  }

  // Analytics for Game Theory Optimization
  async getEngagementMetrics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
    });

    const dailyActivity = activities.reduce((acc, activity) => {
      const date = activity.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + activity.points;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActivities: activities.length,
      totalPoints: activities.reduce((sum, a) => sum + a.points, 0),
      averageDaily: Object.values(dailyActivity).reduce((a, b) => a + b, 0) / days,
      streakData: dailyActivity,
      mostActiveDay: Object.entries(dailyActivity).sort(([,a], [,b]) => b - a)[0],
    };
  }
} 