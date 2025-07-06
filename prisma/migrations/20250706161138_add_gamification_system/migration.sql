/*
  Warnings:

  - Made the column `isArchived` on table `Prompt` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('CREATOR', 'VOTER', 'SOCIAL', 'COLLECTOR', 'STREAK', 'MILESTONE', 'SEASONAL', 'PREMIUM');

-- CreateEnum
CREATE TYPE "AchievementTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('CREATOR', 'VOTER', 'SOCIAL', 'COLLECTOR', 'ACHIEVEMENT', 'SEASONAL', 'PREMIUM', 'SPECIAL');

-- CreateEnum
CREATE TYPE "ChallengeCategory" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'SPECIAL', 'COMMUNITY', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('INDIVIDUAL', 'TEAM', 'COMMUNITY', 'COMPETITIVE');

-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SeasonalTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROMPT_CREATED', 'PROMPT_SHARED', 'VOTE_CAST', 'COMMENT_POSTED', 'ACHIEVEMENT_UNLOCKED', 'LEVEL_UP', 'STREAK_MILESTONE', 'COLLECTION_CREATED', 'CHALLENGE_COMPLETED', 'PREMIUM_FEATURE_USED');

-- CreateEnum
CREATE TYPE "PremiumTier" AS ENUM ('BASIC', 'PREMIUM', 'ELITE', 'EXCLUSIVE');

-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "difficultyLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premiumTier" "PremiumTier",
ADD COLUMN     "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "promptType" SET DEFAULT 'default',
ALTER COLUMN "responseTime" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "model" SET DEFAULT 'gpt-3.5-turbo',
ALTER COLUMN "dataRetentionPolicy" SET DEFAULT '{}',
ALTER COLUMN "isArchived" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "premiumCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seasonalRank" INTEGER,
ADD COLUMN     "seasonalTier" "SeasonalTier",
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCreditsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCreditsSpent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalExperience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPromptsCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPromptsShared" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalVotesCast" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalVotesReceived" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "username" SET DEFAULT '@user' || floor(random() * 1000000)::text;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "tier" "AchievementTier" NOT NULL DEFAULT 'BRONZE',
    "requirements" JSONB NOT NULL,
    "rewards" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" JSONB,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "category" "BadgeCategory" NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "ChallengeCategory" NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "difficulty" "ChallengeDifficulty" NOT NULL,
    "requirements" JSONB NOT NULL,
    "rewards" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxParticipants" INTEGER,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "progress" JSONB NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
    "rewards" JSONB,

    CONSTRAINT "ChallengeParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonalStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "tier" "SeasonalTier" NOT NULL DEFAULT 'BRONZE',
    "rank" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "promptsCreated" INTEGER NOT NULL DEFAULT 0,
    "votesCast" INTEGER NOT NULL DEFAULT 0,
    "creditsEarned" INTEGER NOT NULL DEFAULT 0,
    "achievementsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonalStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCollection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "ActivityType" NOT NULL,
    "details" JSONB,
    "points" INTEGER NOT NULL DEFAULT 0,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streakType" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StreakLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelProgression" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromLevel" INTEGER NOT NULL,
    "toLevel" INTEGER NOT NULL,
    "experienceGained" INTEGER NOT NULL,
    "rewards" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LevelProgression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumFeature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiredTier" "PlanType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- CreateIndex
CREATE INDEX "Achievement_category_idx" ON "Achievement"("category");

-- CreateIndex
CREATE INDEX "Achievement_tier_idx" ON "Achievement"("tier");

-- CreateIndex
CREATE INDEX "Achievement_isActive_idx" ON "Achievement"("isActive");

-- CreateIndex
CREATE INDEX "Achievement_isPremium_idx" ON "Achievement"("isPremium");

-- CreateIndex
CREATE INDEX "Achievement_sortOrder_idx" ON "Achievement"("sortOrder");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");

-- CreateIndex
CREATE INDEX "UserAchievement_unlockedAt_idx" ON "UserAchievement"("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE INDEX "Badge_category_idx" ON "Badge"("category");

-- CreateIndex
CREATE INDEX "Badge_rarity_idx" ON "Badge"("rarity");

-- CreateIndex
CREATE INDEX "Badge_isPremium_idx" ON "Badge"("isPremium");

-- CreateIndex
CREATE INDEX "Badge_isActive_idx" ON "Badge"("isActive");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- CreateIndex
CREATE INDEX "UserBadge_earnedAt_idx" ON "UserBadge"("earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "Challenge_category_idx" ON "Challenge"("category");

-- CreateIndex
CREATE INDEX "Challenge_type_idx" ON "Challenge"("type");

-- CreateIndex
CREATE INDEX "Challenge_difficulty_idx" ON "Challenge"("difficulty");

-- CreateIndex
CREATE INDEX "Challenge_startDate_idx" ON "Challenge"("startDate");

-- CreateIndex
CREATE INDEX "Challenge_endDate_idx" ON "Challenge"("endDate");

-- CreateIndex
CREATE INDEX "Challenge_isPremium_idx" ON "Challenge"("isPremium");

-- CreateIndex
CREATE INDEX "Challenge_isActive_idx" ON "Challenge"("isActive");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_userId_idx" ON "ChallengeParticipation"("userId");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_challengeId_idx" ON "ChallengeParticipation"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_status_idx" ON "ChallengeParticipation"("status");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_startedAt_idx" ON "ChallengeParticipation"("startedAt");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_completedAt_idx" ON "ChallengeParticipation"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeParticipation_userId_challengeId_key" ON "ChallengeParticipation"("userId", "challengeId");

-- CreateIndex
CREATE INDEX "SeasonalStats_userId_idx" ON "SeasonalStats"("userId");

-- CreateIndex
CREATE INDEX "SeasonalStats_season_idx" ON "SeasonalStats"("season");

-- CreateIndex
CREATE INDEX "SeasonalStats_tier_idx" ON "SeasonalStats"("tier");

-- CreateIndex
CREATE INDEX "SeasonalStats_rank_idx" ON "SeasonalStats"("rank");

-- CreateIndex
CREATE INDEX "SeasonalStats_points_idx" ON "SeasonalStats"("points");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonalStats_userId_season_key" ON "SeasonalStats"("userId", "season");

-- CreateIndex
CREATE INDEX "UserCollection_userId_idx" ON "UserCollection"("userId");

-- CreateIndex
CREATE INDEX "UserCollection_isPublic_idx" ON "UserCollection"("isPublic");

-- CreateIndex
CREATE INDEX "UserCollection_isPremium_idx" ON "UserCollection"("isPremium");

-- CreateIndex
CREATE INDEX "UserCollection_createdAt_idx" ON "UserCollection"("createdAt");

-- CreateIndex
CREATE INDEX "CollectionItem_collectionId_idx" ON "CollectionItem"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionItem_promptId_idx" ON "CollectionItem"("promptId");

-- CreateIndex
CREATE INDEX "CollectionItem_addedAt_idx" ON "CollectionItem"("addedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_collectionId_promptId_key" ON "CollectionItem"("collectionId", "promptId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_timestamp_idx" ON "ActivityLog"("timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_points_idx" ON "ActivityLog"("points");

-- CreateIndex
CREATE INDEX "StreakLog_userId_idx" ON "StreakLog"("userId");

-- CreateIndex
CREATE INDEX "StreakLog_streakType_idx" ON "StreakLog"("streakType");

-- CreateIndex
CREATE INDEX "StreakLog_count_idx" ON "StreakLog"("count");

-- CreateIndex
CREATE INDEX "StreakLog_isActive_idx" ON "StreakLog"("isActive");

-- CreateIndex
CREATE INDEX "LevelProgression_userId_idx" ON "LevelProgression"("userId");

-- CreateIndex
CREATE INDEX "LevelProgression_fromLevel_idx" ON "LevelProgression"("fromLevel");

-- CreateIndex
CREATE INDEX "LevelProgression_toLevel_idx" ON "LevelProgression"("toLevel");

-- CreateIndex
CREATE INDEX "LevelProgression_timestamp_idx" ON "LevelProgression"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumFeature_name_key" ON "PremiumFeature"("name");

-- CreateIndex
CREATE INDEX "PremiumFeature_category_idx" ON "PremiumFeature"("category");

-- CreateIndex
CREATE INDEX "PremiumFeature_requiredTier_idx" ON "PremiumFeature"("requiredTier");

-- CreateIndex
CREATE INDEX "PremiumFeature_isActive_idx" ON "PremiumFeature"("isActive");

-- CreateIndex
CREATE INDEX "Prompt_qualityScore_idx" ON "Prompt"("qualityScore");

-- CreateIndex
CREATE INDEX "Prompt_difficultyLevel_idx" ON "Prompt"("difficultyLevel");

-- CreateIndex
CREATE INDEX "Prompt_isPremium_idx" ON "Prompt"("isPremium");

-- CreateIndex
CREATE INDEX "Prompt_premiumTier_idx" ON "Prompt"("premiumTier");

-- CreateIndex
CREATE INDEX "User_level_idx" ON "User"("level");

-- CreateIndex
CREATE INDEX "User_reputation_idx" ON "User"("reputation");

-- CreateIndex
CREATE INDEX "User_streak_idx" ON "User"("streak");

-- CreateIndex
CREATE INDEX "User_seasonalRank_idx" ON "User"("seasonalRank");

-- CreateIndex
CREATE INDEX "User_seasonalTier_idx" ON "User"("seasonalTier");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonalStats" ADD CONSTRAINT "SeasonalStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCollection" ADD CONSTRAINT "UserCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "UserCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakLog" ADD CONSTRAINT "StreakLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelProgression" ADD CONSTRAINT "LevelProgression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
