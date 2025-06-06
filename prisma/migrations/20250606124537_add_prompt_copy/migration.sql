-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "copyCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PromptCopy" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptCopy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptCopy_promptId_idx" ON "PromptCopy"("promptId");

-- CreateIndex
CREATE INDEX "PromptCopy_userId_idx" ON "PromptCopy"("userId");

-- AddForeignKey
ALTER TABLE "PromptCopy" ADD CONSTRAINT "PromptCopy_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptCopy" ADD CONSTRAINT "PromptCopy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
