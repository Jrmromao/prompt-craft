/*
  Warnings:

  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PromptTemplate" DROP CONSTRAINT "PromptTemplate_userId_fkey";

-- DropIndex
DROP INDEX "PromptTemplate_createdAt_idx";

-- AlterTable
ALTER TABLE "PromptTemplate" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "isPublic" SET DEFAULT true;

-- DropTable
DROP TABLE "Template";

-- CreateIndex
CREATE INDEX "PromptTemplate_usageCount_idx" ON "PromptTemplate"("usageCount");

-- CreateIndex
CREATE INDEX "PromptTemplate_rating_idx" ON "PromptTemplate"("rating");

-- AddForeignKey
ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
