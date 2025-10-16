/*
  Warnings:

  - You are about to drop the column `isPremium` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `isSecret` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `difficultyLevel` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteCount` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `followerCount` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `lastViewedAt` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `premiumTier` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `qualityScore` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `responseTime` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `shareCount` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `bestPractices` on the `PromptTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `example` on the `PromptTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `successMetrics` on the `PromptTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dataRetentionPeriod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `languagePreferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastActivityDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `longestStreak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxVersionsPerPrompt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `premiumCredits` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reputation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `seasonalRank` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `seasonalTier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `streak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalCreditsEarned` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalCreditsSpent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalExperience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalPromptsCreated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalPromptsShared` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalVotesCast` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalVotesReceived` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `versionsUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataProcessingRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LevelProgression` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Moderation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaygroundRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptAnalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptBranch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptFavorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptFollow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptTest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptTestHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeasonalStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StreakLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserBadge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PromptToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CollectionItem" DROP CONSTRAINT "CollectionItem_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CollectionItem" DROP CONSTRAINT "CollectionItem_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DataProcessingRecord" DROP CONSTRAINT "DataProcessingRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LevelProgression" DROP CONSTRAINT "LevelProgression_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlaygroundRun" DROP CONSTRAINT "PlaygroundRun_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlaygroundRun" DROP CONSTRAINT "PlaygroundRun_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptAnalytics" DROP CONSTRAINT "PromptAnalytics_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptBranch" DROP CONSTRAINT "PromptBranch_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptFavorite" DROP CONSTRAINT "PromptFavorite_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptFavorite" DROP CONSTRAINT "PromptFavorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptFollow" DROP CONSTRAINT "PromptFollow_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptFollow" DROP CONSTRAINT "PromptFollow_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptRating" DROP CONSTRAINT "PromptRating_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptRating" DROP CONSTRAINT "PromptRating_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptTest" DROP CONSTRAINT "PromptTest_promptVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptTestHistory" DROP CONSTRAINT "PromptTestHistory_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptTestHistory" DROP CONSTRAINT "PromptTestHistory_promptVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptTestHistory" DROP CONSTRAINT "PromptTestHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptView" DROP CONSTRAINT "PromptView_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SeasonalStats" DROP CONSTRAINT "SeasonalStats_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StreakLog" DROP CONSTRAINT "StreakLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadge" DROP CONSTRAINT "UserBadge_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadge" DROP CONSTRAINT "UserBadge_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PromptToTag" DROP CONSTRAINT "_PromptToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PromptToTag" DROP CONSTRAINT "_PromptToTag_B_fkey";

-- DropIndex
DROP INDEX "public"."Achievement_isPremium_idx";

-- DropIndex
DROP INDEX "public"."Achievement_sortOrder_idx";

-- DropIndex
DROP INDEX "public"."Achievement_tier_idx";

-- DropIndex
DROP INDEX "public"."Prompt_difficultyLevel_idx";

-- DropIndex
DROP INDEX "public"."Prompt_favoriteCount_idx";

-- DropIndex
DROP INDEX "public"."Prompt_followerCount_idx";

-- DropIndex
DROP INDEX "public"."Prompt_isPublic_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Prompt_isPublic_isFeatured_idx";

-- DropIndex
DROP INDEX "public"."Prompt_premiumTier_idx";

-- DropIndex
DROP INDEX "public"."Prompt_qualityScore_idx";

-- DropIndex
DROP INDEX "public"."Prompt_userId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."User_dataRetentionPeriod_idx";

-- DropIndex
DROP INDEX "public"."User_lastDataAccess_idx";

-- DropIndex
DROP INDEX "public"."User_level_idx";

-- DropIndex
DROP INDEX "public"."User_profileUrl_idx";

-- DropIndex
DROP INDEX "public"."User_reputation_idx";

-- DropIndex
DROP INDEX "public"."User_seasonalRank_idx";

-- DropIndex
DROP INDEX "public"."User_seasonalTier_idx";

-- DropIndex
DROP INDEX "public"."User_streak_idx";

-- AlterTable
ALTER TABLE "public"."Achievement" DROP COLUMN "isPremium",
DROP COLUMN "isSecret",
DROP COLUMN "sortOrder";

-- AlterTable
ALTER TABLE "public"."Prompt" DROP COLUMN "difficultyLevel",
DROP COLUMN "favoriteCount",
DROP COLUMN "followerCount",
DROP COLUMN "lastViewedAt",
DROP COLUMN "premiumTier",
DROP COLUMN "qualityScore",
DROP COLUMN "responseTime",
DROP COLUMN "shareCount";

-- AlterTable
ALTER TABLE "public"."PromptTemplate" DROP COLUMN "bestPractices",
DROP COLUMN "example",
DROP COLUMN "successMetrics";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "company",
DROP COLUMN "dataRetentionPeriod",
DROP COLUMN "experience",
DROP COLUMN "jobTitle",
DROP COLUMN "languagePreferences",
DROP COLUMN "lastActivityDate",
DROP COLUMN "level",
DROP COLUMN "linkedin",
DROP COLUMN "location",
DROP COLUMN "longestStreak",
DROP COLUMN "maxVersionsPerPrompt",
DROP COLUMN "password",
DROP COLUMN "premiumCredits",
DROP COLUMN "reputation",
DROP COLUMN "seasonalRank",
DROP COLUMN "seasonalTier",
DROP COLUMN "streak",
DROP COLUMN "totalCreditsEarned",
DROP COLUMN "totalCreditsSpent",
DROP COLUMN "totalExperience",
DROP COLUMN "totalPromptsCreated",
DROP COLUMN "totalPromptsShared",
DROP COLUMN "totalVotesCast",
DROP COLUMN "totalVotesReceived",
DROP COLUMN "twitter",
DROP COLUMN "versionsUsed",
DROP COLUMN "website",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "smartRoutingEnabled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "notificationSettings" SET DEFAULT '{"pushNotifications": true, "emailNotifications": true}',
ALTER COLUMN "dataRetentionPolicy" SET DEFAULT '{"autoDelete": false, "retentionPeriod": 365}';

-- DropTable
DROP TABLE "public"."Badge";

-- DropTable
DROP TABLE "public"."CollectionItem";

-- DropTable
DROP TABLE "public"."DataProcessingRecord";

-- DropTable
DROP TABLE "public"."LevelProgression";

-- DropTable
DROP TABLE "public"."Moderation";

-- DropTable
DROP TABLE "public"."PlaygroundRun";

-- DropTable
DROP TABLE "public"."PromptAnalytics";

-- DropTable
DROP TABLE "public"."PromptBranch";

-- DropTable
DROP TABLE "public"."PromptFavorite";

-- DropTable
DROP TABLE "public"."PromptFollow";

-- DropTable
DROP TABLE "public"."PromptRating";

-- DropTable
DROP TABLE "public"."PromptTest";

-- DropTable
DROP TABLE "public"."PromptTestHistory";

-- DropTable
DROP TABLE "public"."PromptView";

-- DropTable
DROP TABLE "public"."Report";

-- DropTable
DROP TABLE "public"."SeasonalStats";

-- DropTable
DROP TABLE "public"."StreakLog";

-- DropTable
DROP TABLE "public"."Tag";

-- DropTable
DROP TABLE "public"."Team";

-- DropTable
DROP TABLE "public"."UserBadge";

-- DropTable
DROP TABLE "public"."UserSettings";

-- DropTable
DROP TABLE "public"."_PromptToTag";

-- DropEnum
DROP TYPE "public"."BadgeCategory";

-- DropEnum
DROP TYPE "public"."BadgeRarity";

-- DropEnum
DROP TYPE "public"."Period";

-- DropEnum
DROP TYPE "public"."PremiumTier";

-- DropEnum
DROP TYPE "public"."SeasonalTier";

-- DropEnum
DROP TYPE "public"."TestStatus";

-- CreateTable
CREATE TABLE "public"."QualityFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BreachLog" (
    "id" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breachType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "affectedUsersCount" INTEGER NOT NULL,
    "dataCategories" TEXT[],
    "containmentActions" TEXT NOT NULL,
    "authorityNotifiedAt" TIMESTAMP(3),
    "usersNotifiedAt" TIMESTAMP(3),
    "resolutionDate" TIMESTAMP(3),
    "lessonsLearned" TEXT,
    "rootCause" TEXT,

    CONSTRAINT "BreachLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QualityFeedback_userId_idx" ON "public"."QualityFeedback"("userId");

-- CreateIndex
CREATE INDEX "QualityFeedback_runId_idx" ON "public"."QualityFeedback"("runId");

-- CreateIndex
CREATE INDEX "QualityFeedback_createdAt_idx" ON "public"."QualityFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "BreachLog_detectedAt_idx" ON "public"."BreachLog"("detectedAt");

-- CreateIndex
CREATE INDEX "BreachLog_severity_idx" ON "public"."BreachLog"("severity");

-- CreateIndex
CREATE INDEX "BreachLog_breachType_idx" ON "public"."BreachLog"("breachType");

-- AddForeignKey
ALTER TABLE "public"."QualityFeedback" ADD CONSTRAINT "QualityFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QualityFeedback" ADD CONSTRAINT "QualityFeedback_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."PromptRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."notification_created_at_idx" RENAME TO "Notification_createdAt_idx";

-- RenameIndex
ALTER INDEX "public"."notification_type_idx" RENAME TO "Notification_type_idx";

-- RenameIndex
ALTER INDEX "public"."notification_user_id_idx" RENAME TO "Notification_userId_idx";

-- RenameIndex
ALTER INDEX "public"."prompt_created_at_idx" RENAME TO "Prompt_createdAt_idx";

-- RenameIndex
ALTER INDEX "public"."prompt_updated_at_idx" RENAME TO "Prompt_updatedAt_idx";

-- RenameIndex
ALTER INDEX "public"."user_created_at_idx" RENAME TO "User_createdAt_idx";

-- RenameIndex
ALTER INDEX "public"."user_updated_at_idx" RENAME TO "User_updatedAt_idx";
