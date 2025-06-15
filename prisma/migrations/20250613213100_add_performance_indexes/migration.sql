-- Drop existing indexes if they exist
DROP INDEX IF EXISTS "Notification_type_idx";
DROP INDEX IF EXISTS "Notification_userId_idx";
DROP INDEX IF EXISTS "Notification_createdAt_idx";

-- Create new indexes with proper names
CREATE INDEX IF NOT EXISTS "notification_type_idx" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "notification_user_id_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "notification_created_at_idx" ON "Notification"("createdAt");

-- Add other performance indexes
CREATE INDEX IF NOT EXISTS "prompt_created_at_idx" ON "Prompt"("createdAt");
CREATE INDEX IF NOT EXISTS "prompt_updated_at_idx" ON "Prompt"("updatedAt");
CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "user_updated_at_idx" ON "User"("updatedAt");

-- Add performance-related indexes
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");
CREATE INDEX "User_dataRetentionPeriod_idx" ON "User"("dataRetentionPeriod");
CREATE INDEX "User_lastDataAccess_idx" ON "User"("lastDataAccess");

CREATE INDEX "Prompt_isPublic_idx" ON "Prompt"("isPublic");
CREATE INDEX "Prompt_promptType_idx" ON "Prompt"("promptType");
CREATE INDEX "Prompt_model_idx" ON "Prompt"("model");
CREATE INDEX "Prompt_lastUsedAt_idx" ON "Prompt"("lastUsedAt");

CREATE INDEX "Subscription_cancelAtPeriodEnd_idx" ON "Subscription"("cancelAtPeriodEnd");
CREATE INDEX "Subscription_updatedAt_idx" ON "Subscription"("updatedAt");

CREATE INDEX "Usage_count_idx" ON "Usage"("count");

CREATE INDEX "PromptGeneration_creditsUsed_idx" ON "PromptGeneration"("creditsUsed");

CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

CREATE INDEX "Team_createdAt_idx" ON "Team"("createdAt");

CREATE INDEX "DataProcessingRecord_purpose_idx" ON "DataProcessingRecord"("purpose"); 