/*
  Warnings:

  - You are about to drop the column `avgRating` on the `PromptAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `uses` on the `PromptAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `PromptAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `baseVersion` on the `PromptBranch` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PromptBranch` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `PromptUsage` table. All the data in the column will be lost.
  - You are about to drop the column `input` on the `PromptUsage` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `PromptUsage` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `PromptUsage` table. All the data in the column will be lost.
  - You are about to drop the column `changes` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `referrer` on the `PromptView` table. All the data in the column will be lost.
  - Added the required column `promptId` to the `CommentLike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `PromptBranch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "PromptBranch" DROP CONSTRAINT "PromptBranch_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PromptBranch" DROP CONSTRAINT "PromptBranch_promptId_fkey";

-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_promptId_fkey";

-- DropForeignKey
ALTER TABLE "PromptView" DROP CONSTRAINT "PromptView_userId_fkey";

-- DropIndex
DROP INDEX "Prompt_promptType_idx";

-- DropIndex
DROP INDEX "PromptAnalytics_promptId_idx";

-- DropIndex
DROP INDEX "PromptBranch_createdBy_idx";

-- DropIndex
DROP INDEX "PromptUsage_createdAt_idx";

-- DropIndex
DROP INDEX "PromptVersion_createdBy_idx";

-- DropIndex
DROP INDEX "PromptVersion_version_idx";

-- DropIndex
DROP INDEX "PromptView_createdAt_idx";

-- DropIndex
DROP INDEX "Tag_name_idx";

-- AlterTable
ALTER TABLE "CommentLike" ADD COLUMN     "promptId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "promptType" SET DEFAULT 'text';

-- AlterTable
ALTER TABLE "PromptAnalytics" DROP COLUMN "avgRating",
DROP COLUMN "uses",
DROP COLUMN "views";

-- AlterTable
ALTER TABLE "PromptBranch" DROP COLUMN "baseVersion",
DROP COLUMN "createdBy",
ADD COLUMN     "content" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PromptUsage" DROP COLUMN "error",
DROP COLUMN "input",
DROP COLUMN "output",
DROP COLUMN "success",
ADD COLUMN     "result" JSONB;

-- AlterTable
ALTER TABLE "PromptVersion" DROP COLUMN "changes",
DROP COLUMN "createdBy",
DROP COLUMN "description",
DROP COLUMN "isPublished",
DROP COLUMN "version";

-- AlterTable
ALTER TABLE "PromptView" DROP COLUMN "referrer";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "credits" SET DEFAULT 0,
ALTER COLUMN "creditCap" SET DEFAULT 100,
ALTER COLUMN "lastCreditReset" DROP NOT NULL,
ALTER COLUMN "lastCreditReset" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "CommentLike_promptId_idx" ON "CommentLike"("promptId");

-- CreateIndex
CREATE INDEX "Prompt_isPublic_idx" ON "Prompt"("isPublic");

-- CreateIndex
CREATE INDEX "Prompt_isApproved_idx" ON "Prompt"("isApproved");

-- CreateIndex
CREATE INDEX "Prompt_slug_idx" ON "Prompt"("slug");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptBranch" ADD CONSTRAINT "PromptBranch_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
