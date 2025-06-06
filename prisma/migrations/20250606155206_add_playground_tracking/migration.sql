/*
  Warnings:

  - You are about to drop the column `prompt` on the `PlaygroundRun` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `PlaygroundRun` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PlaygroundRun` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `promptType` on the `Prompt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `input` to the `PlaygroundRun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Prompt_isApproved_idx";

-- DropIndex
DROP INDEX "Prompt_isPublic_idx";

-- First, add new columns with default values
ALTER TABLE "PlaygroundRun" 
ADD COLUMN "error" TEXT,
ADD COLUMN "input" TEXT,
ADD COLUMN "output" TEXT,
ADD COLUMN "promptId" TEXT;

-- Migrate existing data
UPDATE "PlaygroundRun"
SET "input" = "prompt",
    "output" = "result",
    "error" = CASE WHEN "status" != 'SUCCESS' THEN "status" ELSE NULL END;

-- Now make the columns required
ALTER TABLE "PlaygroundRun" 
ALTER COLUMN "input" SET NOT NULL;

-- Drop old columns
ALTER TABLE "PlaygroundRun" 
DROP COLUMN "prompt",
DROP COLUMN "result",
DROP COLUMN "status";

-- Add slug to Tag table with default value
ALTER TABLE "Tag" 
ADD COLUMN "slug" TEXT;

-- Generate slugs from names
UPDATE "Tag"
SET "slug" = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'));

-- Make slug required and unique
ALTER TABLE "Tag" 
ALTER COLUMN "slug" SET NOT NULL;

-- Drop old columns from Prompt
ALTER TABLE "Prompt" 
DROP COLUMN "isApproved",
DROP COLUMN "metadata",
DROP COLUMN "promptType";

-- Create indexes
CREATE INDEX "PlaygroundRun_promptId_idx" ON "PlaygroundRun"("promptId");
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- Add foreign key
ALTER TABLE "PlaygroundRun" 
ADD CONSTRAINT "PlaygroundRun_promptId_fkey" 
FOREIGN KEY ("promptId") 
REFERENCES "Prompt"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
