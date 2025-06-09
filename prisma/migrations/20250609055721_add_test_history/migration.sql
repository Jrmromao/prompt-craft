-- CreateTable
CREATE TABLE "PromptTestHistory" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "ratingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testInput" TEXT,
    "testOutput" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "duration" INTEGER,

    CONSTRAINT "PromptTestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptTestHistory_promptId_idx" ON "PromptTestHistory"("promptId");

-- CreateIndex
CREATE INDEX "PromptTestHistory_userId_idx" ON "PromptTestHistory"("userId");

-- CreateIndex
CREATE INDEX "PromptTestHistory_versionId_idx" ON "PromptTestHistory"("versionId");

-- CreateIndex
CREATE INDEX "PromptTestHistory_createdAt_idx" ON "PromptTestHistory"("createdAt");

-- CreateIndex
CREATE INDEX "PromptTestHistory_ratingId_idx" ON "PromptTestHistory"("ratingId");

-- AddForeignKey
ALTER TABLE "PromptTestHistory" ADD CONSTRAINT "PromptTestHistory_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTestHistory" ADD CONSTRAINT "PromptTestHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTestHistory" ADD CONSTRAINT "PromptTestHistory_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTestHistory" ADD CONSTRAINT "PromptTestHistory_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "PromptRating"("id") ON DELETE SET NULL ON UPDATE CASCADE;
