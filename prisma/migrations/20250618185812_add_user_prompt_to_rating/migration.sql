/*
  Warnings:

  - You are about to drop the column `promptTestId` on the `PromptRating` table. All the data in the column will be lost.
  - You are about to drop the column `testHistoryId` on the `PromptRating` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,promptId]` on the table `PromptRating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `promptId` to the `PromptRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PromptRating` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PromptRating" DROP CONSTRAINT "PromptRating_promptTestId_fkey";

-- DropForeignKey
ALTER TABLE "PromptRating" DROP CONSTRAINT "PromptRating_testHistoryId_fkey";

-- DropIndex
DROP INDEX "PromptRating_promptTestId_key";

-- DropIndex
DROP INDEX "PromptRating_testHistoryId_key";

-- AlterTable
ALTER TABLE "PromptRating" DROP COLUMN "promptTestId",
DROP COLUMN "testHistoryId",
ADD COLUMN     "promptId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT '@user' || floor(random() * 1000000)::text;

-- CreateIndex
CREATE UNIQUE INDEX "PromptRating_userId_promptId_key" ON "PromptRating"("userId", "promptId");

-- AddForeignKey
ALTER TABLE "PromptRating" ADD CONSTRAINT "PromptRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptRating" ADD CONSTRAINT "PromptRating_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
