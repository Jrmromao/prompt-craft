-- Drop conflicting indexes if they exist
DROP INDEX IF EXISTS "Notification_type_idx";
DROP INDEX IF EXISTS "Notification_userId_idx";
DROP INDEX IF EXISTS "Notification_createdAt_idx";

-- Recreate indexes with proper names
CREATE INDEX IF NOT EXISTS "notification_type_idx" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "notification_user_id_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "notification_created_at_idx" ON "Notification"("createdAt"); 