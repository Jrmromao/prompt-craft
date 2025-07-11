import prisma from '../../app/db';
import { PlanType } from '../../utils/constants';

export async function seedGamification() {
  console.log('🎮 Seeding gamification data...');

  // Seed Achievements
  const achievements = [
    {
      id: 'first-prompt',
      name: 'First Steps',
      description: 'Create your first prompt',
      icon: '🚀',
      category: 'CREATOR' as const,
      tier: 'BRONZE' as const,
      requirements: { promptsCreated: 1 },
      rewards: { credits: 10, experience: 50, badges: ['newcomer'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 1,
    },
    {
      id: 'prompt-creator-5',
      name: 'Getting Started',
      description: 'Create 5 prompts',
      icon: '✨',
      category: 'CREATOR' as const,
      tier: 'BRONZE' as const,
      requirements: { promptsCreated: 5 },
      rewards: { credits: 25, experience: 100, badges: ['creator'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 2,
    },
    {
      id: 'prompt-creator-25',
      name: 'Prolific Creator',
      description: 'Create 25 prompts',
      icon: '🎨',
      category: 'CREATOR' as const,
      tier: 'SILVER' as const,
      requirements: { promptsCreated: 25 },
      rewards: { credits: 100, experience: 300, badges: ['prolific'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 3,
    },
    {
      id: 'prompt-creator-100',
      name: 'Master Creator',
      description: 'Create 100 prompts',
      icon: '👑',
      category: 'CREATOR' as const,
      tier: 'GOLD' as const,
      requirements: { promptsCreated: 100 },
      rewards: { credits: 500, experience: 1000, badges: ['master'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 4,
    },
    {
      id: 'active-voter',
      name: 'Community Supporter',
      description: 'Cast 10 votes',
      icon: '👍',
      category: 'VOTER' as const,
      tier: 'BRONZE' as const,
      requirements: { votesCast: 10 },
      rewards: { credits: 15, experience: 75, badges: ['supporter'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 5,
    },
    {
      id: 'super-voter',
      name: 'Super Voter',
      description: 'Cast 100 votes',
      icon: '⭐',
      category: 'VOTER' as const,
      tier: 'SILVER' as const,
      requirements: { votesCast: 100 },
      rewards: { credits: 75, experience: 250, badges: ['super-voter'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 6,
    },
    {
      id: 'social-butterfly',
      name: 'Social Butterfly',
      description: 'Post 20 comments',
      icon: '💬',
      category: 'SOCIAL' as const,
      tier: 'BRONZE' as const,
      requirements: { commentsPosted: 20 },
      rewards: { credits: 30, experience: 150, badges: ['social'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 7,
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintain a 30-day streak',
      icon: '🔥',
      category: 'STREAK' as const,
      tier: 'GOLD' as const,
      requirements: { streakDays: 30 },
      rewards: { credits: 200, experience: 500, badges: ['streak-master'] },
      isActive: true,
      isSecret: false,
      isPremium: false,
      sortOrder: 8,
    },
    {
      id: 'premium-explorer',
      name: 'Premium Explorer',
      description: 'Use 10 premium features',
      icon: '💎',
      category: 'PREMIUM' as const,
      tier: 'PLATINUM' as const,
      requirements: { premiumActionsUsed: 10 },
      rewards: { credits: 300, experience: 750, badges: ['premium-explorer'] },
      isActive: true,
      isSecret: false,
      isPremium: true,
      sortOrder: 9,
    },
    {
      id: 'legendary-creator',
      name: 'Legendary Creator',
      description: 'Create 1000 prompts',
      icon: '🏆',
      category: 'CREATOR' as const,
      tier: 'LEGENDARY' as const,
      requirements: { promptsCreated: 1000 },
      rewards: { credits: 2500, experience: 5000, badges: ['legendary'] },
      isActive: true,
      isSecret: true,
      isPremium: false,
      sortOrder: 10,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement,
    });
  }

  // Seed Badges
  const badges = [
    {
      id: 'newcomer',
      name: 'Newcomer',
      description: 'Welcome to the community!',
      icon: '🌟',
      color: '#10b981',
      rarity: 'COMMON' as const,
      category: 'ACHIEVEMENT' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'creator',
      name: 'Creator',
      description: 'Actively creating prompts',
      icon: '✨',
      color: '#3b82f6',
      rarity: 'COMMON' as const,
      category: 'CREATOR' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'prolific',
      name: 'Prolific',
      description: 'Highly productive creator',
      icon: '🎨',
      color: '#8b5cf6',
      rarity: 'UNCOMMON' as const,
      category: 'CREATOR' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'master',
      name: 'Master',
      description: 'Master of prompt creation',
      icon: '👑',
      color: '#f59e0b',
      rarity: 'RARE' as const,
      category: 'CREATOR' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'legendary',
      name: 'Legendary',
      description: 'Legendary status achieved',
      icon: '🏆',
      color: '#ef4444',
      rarity: 'LEGENDARY' as const,
      category: 'SPECIAL' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'supporter',
      name: 'Supporter',
      description: 'Supports the community',
      icon: '👍',
      color: '#10b981',
      rarity: 'COMMON' as const,
      category: 'VOTER' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'super-voter',
      name: 'Super Voter',
      description: 'Exceptional voting activity',
      icon: '⭐',
      color: '#f59e0b',
      rarity: 'UNCOMMON' as const,
      category: 'VOTER' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'social',
      name: 'Social',
      description: 'Active in discussions',
      icon: '💬',
      color: '#8b5cf6',
      rarity: 'COMMON' as const,
      category: 'SOCIAL' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintains long streaks',
      icon: '🔥',
      color: '#f97316',
      rarity: 'RARE' as const,
      category: 'ACHIEVEMENT' as const,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'premium-explorer',
      name: 'Premium Explorer',
      description: 'Premium feature enthusiast',
      icon: '💎',
      color: '#ec4899',
      rarity: 'EPIC' as const,
      category: 'PREMIUM' as const,
      isPremium: true,
      isActive: true,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: badge,
      create: badge,
    });
  }

  // Seed Challenges
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const challenges = [
    {
      id: 'daily-creator',
      name: 'Daily Creator',
      description: 'Create a prompt every day this week',
      icon: '📝',
      category: 'DAILY' as const,
      type: 'INDIVIDUAL' as const,
      difficulty: 'EASY' as const,
      requirements: { promptsPerDay: 1, days: 7 },
      rewards: { credits: 100, experience: 200, badges: ['daily-creator'] },
      startDate: now,
      endDate: nextWeek,
      maxParticipants: null,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'weekly-voter',
      name: 'Weekly Voter',
      description: 'Cast 50 votes this week',
      icon: '🗳️',
      category: 'WEEKLY' as const,
      type: 'INDIVIDUAL' as const,
      difficulty: 'MEDIUM' as const,
      requirements: { votes: 50 },
      rewards: { credits: 75, experience: 150, badges: ['weekly-voter'] },
      startDate: now,
      endDate: nextWeek,
      maxParticipants: null,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'monthly-master',
      name: 'Monthly Master',
      description: 'Create 50 high-quality prompts this month',
      icon: '🎯',
      category: 'MONTHLY' as const,
      type: 'INDIVIDUAL' as const,
      difficulty: 'HARD' as const,
      requirements: { prompts: 50, minQuality: 4.0 },
      rewards: { credits: 500, experience: 1000, badges: ['monthly-master'] },
      startDate: now,
      endDate: nextMonth,
      maxParticipants: null,
      isPremium: false,
      isActive: true,
    },
    {
      id: 'premium-challenge',
      name: 'Premium Creator Challenge',
      description: 'Use advanced features to create 10 premium prompts',
      icon: '💎',
      category: 'PREMIUM' as const,
      type: 'INDIVIDUAL' as const,
      difficulty: 'EXPERT' as const,
      requirements: { premiumPrompts: 10 },
      rewards: { credits: 750, experience: 1500, badges: ['premium-creator'] },
      startDate: now,
      endDate: nextMonth,
      maxParticipants: 100,
      isPremium: true,
      isActive: true,
    },
    {
      id: 'community-challenge',
      name: 'Community Growth Challenge',
      description: 'Help grow the community by inviting friends',
      icon: '🌱',
      category: 'COMMUNITY' as const,
      type: 'COMMUNITY' as const,
      difficulty: 'MEDIUM' as const,
      requirements: { referrals: 5 },
      rewards: { credits: 300, experience: 600, badges: ['community-builder'] },
      startDate: now,
      endDate: nextMonth,
      maxParticipants: null,
      isPremium: false,
      isActive: true,
    },
  ];

  for (const challenge of challenges) {
    await prisma.challenge.upsert({
      where: { id: challenge.id },
      update: challenge,
      create: challenge,
    });
  }

  // Seed Premium Features
  const premiumFeatures = [
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights into prompt performance',
      category: 'analytics',
      requiredTier: PlanType.PRO,
      isActive: true,
      config: { features: ['detailed-stats', 'trend-analysis', 'export-data'] },
    },
    {
      id: 'custom-collections',
      name: 'Custom Collections',
      description: 'Create and organize custom prompt collections',
      category: 'organization',
      requiredTier: PlanType.PRO,
      isActive: true,
      config: { maxCollections: 50, maxItemsPerCollection: 1000 },
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      description: 'Get faster response times for support requests',
      category: 'support',
      requiredTier: PlanType.PRO,
      isActive: true,
      config: { responseTime: '4h', channels: ['email', 'chat'] },
    },
    {
      id: 'premium-templates',
      name: 'Premium Templates',
      description: 'Access to exclusive prompt templates',
      category: 'content',
      requiredTier: PlanType.PRO,
      isActive: true,
      config: { templateCount: 100, categories: ['business', 'creative', 'technical'] },
    },
    {
      id: 'api-access',
      name: 'API Access',
      description: 'Programmatic access to your prompts and data',
      category: 'integration',
      requiredTier: PlanType.PRO,
      isActive: true,
      config: { rateLimit: 1000, endpoints: ['prompts', 'analytics', 'collections'] },
    },
    {
      id: 'collaboration-tools',
      name: 'Collaboration Tools',
      description: 'Share and collaborate on prompts with teams',
      category: 'collaboration',
      requiredTier: PlanType.PRO,
      isActive: true,
      config: { maxTeamSize: 10, features: ['shared-collections', 'comments', 'version-control'] },
    },
  ];

  for (const feature of premiumFeatures) {
    await prisma.premiumFeature.upsert({
      where: { id: feature.id },
      update: feature,
      create: feature,
    });
  }

  console.log('✅ Gamification data seeded successfully!');
}

// Run seeder if called directly
if (require.main === module) {
  seedGamification()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
} 