-- Create a temporary table to store the current roles
CREATE TABLE IF NOT EXISTS "UserRoleBackup" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    PRIMARY KEY ("id")
);

-- Copy current role data
INSERT INTO "UserRoleBackup" ("id", "role")
SELECT "id", "role" FROM "User";

-- Add the new email templates table
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[] NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");
CREATE INDEX "EmailTemplate_type_idx" ON "EmailTemplate"("type");
CREATE INDEX "EmailTemplate_isActive_idx" ON "EmailTemplate"("isActive");

-- Add foreign key constraints
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update User table to add the new relations
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdTemplates" TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedTemplates" TEXT[];

-- Restore the role data
UPDATE "User" u
SET "role" = b."role"
FROM "UserRoleBackup" b
WHERE u."id" = b."id";

-- Drop the temporary table
DROP TABLE "UserRoleBackup"; 