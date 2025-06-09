-- CreateTable
CREATE TABLE "PromptRating" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clarity" INTEGER NOT NULL,
    "specificity" INTEGER NOT NULL,
    "context" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "helpfulness" INTEGER,
    "difficulty" INTEGER,
    "quality" INTEGER,
    "tags" TEXT[],

    CONSTRAINT "PromptRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptRating_promptId_idx" ON "PromptRating"("promptId");

-- CreateIndex
CREATE INDEX "PromptRating_userId_idx" ON "PromptRating"("userId");

-- CreateIndex
CREATE INDEX "PromptRating_createdAt_idx" ON "PromptRating"("createdAt");

-- CreateIndex
CREATE INDEX "PromptRating_overall_idx" ON "PromptRating"("overall");

-- CreateIndex
CREATE UNIQUE INDEX "PromptRating_userId_promptId_key" ON "PromptRating"("userId", "promptId");

-- AddForeignKey
ALTER TABLE "PromptRating" ADD CONSTRAINT "PromptRating_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptRating" ADD CONSTRAINT "PromptRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
