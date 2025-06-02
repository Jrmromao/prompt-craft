/*
  Warnings:

  - You are about to drop the column `creditsUsed` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `input` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `Prompt` table. All the data in the column will be lost.
  - Added the required column `content` to the `Prompt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Prompt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promptType` to the `Prompt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Prompt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- DropIndex
DROP INDEX "Prompt_createdAt_idx";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "creditsUsed",
DROP COLUMN "input",
DROP COLUMN "model",
DROP COLUMN "output",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "promptType" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptType" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PromptToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PromptToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "PromptGeneration_userId_idx" ON "PromptGeneration"("userId");

-- CreateIndex
CREATE INDEX "PromptGeneration_promptType_idx" ON "PromptGeneration"("promptType");

-- CreateIndex
CREATE INDEX "PromptGeneration_createdAt_idx" ON "PromptGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "_PromptToTag_B_index" ON "_PromptToTag"("B");

-- CreateIndex
CREATE INDEX "Prompt_promptType_idx" ON "Prompt"("promptType");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptGeneration" ADD CONSTRAINT "PromptGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptToTag" ADD CONSTRAINT "_PromptToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptToTag" ADD CONSTRAINT "_PromptToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
