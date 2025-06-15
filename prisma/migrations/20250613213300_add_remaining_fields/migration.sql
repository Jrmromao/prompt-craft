-- Add remaining fields
ALTER TABLE "Comment" ADD COLUMN "isEdited" BOOLEAN DEFAULT false;
ALTER TABLE "Comment" ADD COLUMN "editedAt" TIMESTAMP(3);
ALTER TABLE "Comment" ADD COLUMN "isArchived" BOOLEAN DEFAULT false;
ALTER TABLE "Comment" ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "Team" ADD COLUMN "isActive" BOOLEAN DEFAULT true;

ALTER TABLE "Notification" ADD COLUMN "isRead" BOOLEAN DEFAULT false; 