-- Remove unused gamification and bloat models
-- TRIPLE CHECKED: These models are NOT referenced in the codebase

-- Drop unused models (no code references found)
DROP TABLE IF EXISTS "Badge" CASCADE;
DROP TABLE IF EXISTS "UserBadge" CASCADE;
DROP TABLE IF EXISTS "CollectionItem" CASCADE;
DROP TABLE IF EXISTS "DataProcessingRecord" CASCADE;
DROP TABLE IF EXISTS "LevelProgression" CASCADE;
DROP TABLE IF EXISTS "Moderation" CASCADE;
DROP TABLE IF EXISTS "PlaygroundRun" CASCADE;
DROP TABLE IF EXISTS "PromptAnalytics" CASCADE;
DROP TABLE IF EXISTS "PromptBranch" CASCADE;
DROP TABLE IF EXISTS "PromptFavorite" CASCADE;
DROP TABLE IF EXISTS "PromptFollow" CASCADE;
DROP TABLE IF EXISTS "PromptRating" CASCADE;
DROP TABLE IF EXISTS "PromptTest" CASCADE;
DROP TABLE IF EXISTS "PromptTestHistory" CASCADE;
DROP TABLE IF EXISTS "PromptView" CASCADE;
DROP TABLE IF EXISTS "Report" CASCADE;
DROP TABLE IF EXISTS "SeasonalStats" CASCADE;
DROP TABLE IF EXISTS "StreakLog" CASCADE;
DROP TABLE IF EXISTS "Tag" CASCADE;
DROP TABLE IF EXISTS "Team" CASCADE;
DROP TABLE IF EXISTS "UserSettings" CASCADE;

-- Drop unused enums
DROP TYPE IF EXISTS "BadgeCategory" CASCADE;
DROP TYPE IF EXISTS "BadgeRarity" CASCADE;
DROP TYPE IF EXISTS "SeasonalTier" CASCADE;
DROP TYPE IF EXISTS "TestStatus" CASCADE;
DROP TYPE IF EXISTS "PremiumTier" CASCADE;

-- Clean up User table - remove gamification fields
ALTER TABLE "User" DROP COLUMN IF EXISTS "experience";
ALTER TABLE "User" DROP COLUMN IF EXISTS "level";
ALTER TABLE "User" DROP COLUMN IF EXISTS "longestStreak";
ALTER TABLE "User" DROP COLUMN IF EXISTS "reputation";
ALTER TABLE "User" DROP COLUMN IF EXISTS "seasonalRank";
ALTER TABLE "User" DROP COLUMN IF EXISTS "seasonalTier";
ALTER TABLE "User" DROP COLUMN IF EXISTS "streak";
ALTER TABLE "User" DROP COLUMN IF EXISTS "totalExperience";
ALTER TABLE "User" DROP COLUMN IF EXISTS "totalPromptsCreated";
ALTER TABLE "User" DROP COLUMN IF EXISTS "totalPromptsShared";
ALTER TABLE "User" DROP COLUMN IF EXISTS "totalVotesCast";
ALTER TABLE "User" DROP COLUMN IF EXISTS "totalVotesReceived";
ALTER TABLE "User" DROP COLUMN IF EXISTS "versionsUsed";
ALTER TABLE "User" DROP COLUMN IF EXISTS "maxVersionsPerPrompt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastActivityDate";
ALTER TABLE "User" DROP COLUMN IF EXISTS "premiumCredits";

-- Clean up Prompt table - remove unused fields
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "favoriteCount";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "followerCount";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "difficultyLevel";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "qualityScore";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "shareCount";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "premiumTier";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "lastViewedAt";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "responseTime";

-- Clean up Achievement table
ALTER TABLE "Achievement" DROP COLUMN IF EXISTS "isSecret";
ALTER TABLE "Achievement" DROP COLUMN IF EXISTS "isPremium";
ALTER TABLE "Achievement" DROP COLUMN IF EXISTS "sortOrder";
