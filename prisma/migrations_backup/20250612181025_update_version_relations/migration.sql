/*
  Warnings:

  - You are about to drop the `PromptVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PromptTest" DROP CONSTRAINT "PromptTest_promptVersionId_fkey";

-- DropForeignKey
ALTER TABLE "PromptTestHistory" DROP CONSTRAINT "PromptTestHistory_promptVersionId_fkey";

-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_promptId_fkey";

-- DropTable
DROP TABLE "PromptVersion";

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "convertedToPrompt" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "promptId" TEXT,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Version_userId_idx" ON "Version"("userId");

-- CreateIndex
CREATE INDEX "Version_promptId_idx" ON "Version"("promptId");

-- AddForeignKey
ALTER TABLE "PromptTestHistory" ADD CONSTRAINT "PromptTestHistory_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTest" ADD CONSTRAINT "PromptTest_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
