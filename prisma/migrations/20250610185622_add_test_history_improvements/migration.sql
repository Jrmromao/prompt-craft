/*
  Warnings:

  - You are about to drop the column `difficulty` on the `PromptRating` table. All the data in the column will be lost.
  - You are about to drop the column `helpfulness` on the `PromptRating` table. All the data in the column will be lost.
  - You are about to drop the column `promptId` on the `PromptRating` table. All the data in the column will be lost.
  - You are about to drop the column `quality` on the `PromptRating` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `PromptRating` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PromptRating` table. All the data in the column will be lost.
  - You are about to drop the column `ratingId` on the `PromptTestHistory` table. All the data in the column will be lost.
  - You are about to drop the column `testInput` on the `PromptTestHistory` table. All the data in the column will be lost.
  - You are about to drop the column `testOutput` on the `PromptTestHistory` table. All the data in the column will be lost.
  - You are about to drop the column `versionId` on the `PromptTestHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[promptTestId]` on the table `PromptRating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testHistoryId]` on the table `PromptRating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `promptTestId` to the `PromptRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `output` to the `PromptTestHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promptVersionId` to the `PromptTestHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PromptTestHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('SUCCESS', 'FAILURE', 'ERROR', 'PENDING');

-- DropForeignKey
ALTER TABLE "PromptRating" DROP CONSTRAINT "PromptRating_promptId_fkey";

-- DropForeignKey
ALTER TABLE "PromptRating" DROP CONSTRAINT "PromptRating_userId_fkey";

-- DropForeignKey
ALTER TABLE "PromptTestHistory" DROP CONSTRAINT "PromptTestHistory_ratingId_fkey";

-- DropForeignKey
ALTER TABLE "PromptTestHistory" DROP CONSTRAINT "PromptTestHistory_versionId_fkey";

-- DropIndex
DROP INDEX "PromptRating_createdAt_idx";

-- DropIndex
DROP INDEX "PromptRating_overall_idx";

-- DropIndex
DROP INDEX "PromptRating_promptId_idx";

-- DropIndex
DROP INDEX "PromptRating_userId_idx";

-- DropIndex
DROP INDEX "PromptRating_userId_promptId_key";

-- DropIndex
DROP INDEX "PromptTestHistory_createdAt_idx";

-- DropIndex
DROP INDEX "PromptTestHistory_ratingId_idx";

-- DropIndex
DROP INDEX "PromptTestHistory_versionId_idx";

-- AlterTable
ALTER TABLE "PromptRating" DROP COLUMN "difficulty",
DROP COLUMN "helpfulness",
DROP COLUMN "promptId",
DROP COLUMN "quality",
DROP COLUMN "tags",
DROP COLUMN "userId",
ADD COLUMN     "promptTestId" TEXT NOT NULL,
ADD COLUMN     "testHistoryId" TEXT,
ALTER COLUMN "clarity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "specificity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "context" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "overall" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PromptTestHistory" DROP COLUMN "ratingId",
DROP COLUMN "testInput",
DROP COLUMN "testOutput",
DROP COLUMN "versionId",
ADD COLUMN     "input" TEXT,
ADD COLUMN     "output" TEXT NOT NULL,
ADD COLUMN     "promptVersionId" TEXT NOT NULL,
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PromptTest" (
    "id" TEXT NOT NULL,
    "promptVersionId" TEXT NOT NULL,
    "input" TEXT,
    "output" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptTest_promptVersionId_idx" ON "PromptTest"("promptVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptRating_promptTestId_key" ON "PromptRating"("promptTestId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptRating_testHistoryId_key" ON "PromptRating"("testHistoryId");

-- CreateIndex
CREATE INDEX "PromptTestHistory_promptVersionId_idx" ON "PromptTestHistory"("promptVersionId");

-- CreateIndex
CREATE INDEX "PromptTestHistory_status_idx" ON "PromptTestHistory"("status");

-- AddForeignKey
ALTER TABLE "PromptRating" ADD CONSTRAINT "PromptRating_promptTestId_fkey" FOREIGN KEY ("promptTestId") REFERENCES "PromptTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptRating" ADD CONSTRAINT "PromptRating_testHistoryId_fkey" FOREIGN KEY ("testHistoryId") REFERENCES "PromptTestHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTestHistory" ADD CONSTRAINT "PromptTestHistory_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTest" ADD CONSTRAINT "PromptTest_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
