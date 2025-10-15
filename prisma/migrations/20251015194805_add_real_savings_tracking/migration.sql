-- AlterTable
ALTER TABLE "public"."PromptRun" ADD COLUMN     "inputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "outputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requestedModel" TEXT,
ADD COLUMN     "savings" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."PromptOptimization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalPrompt" TEXT NOT NULL,
    "optimizedPrompt" TEXT NOT NULL,
    "tokenReduction" INTEGER NOT NULL,
    "estimatedSavings" DOUBLE PRECISION NOT NULL,
    "targetModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptOptimization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptOptimization_userId_idx" ON "public"."PromptOptimization"("userId");

-- CreateIndex
CREATE INDEX "PromptOptimization_createdAt_idx" ON "public"."PromptOptimization"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."PromptOptimization" ADD CONSTRAINT "PromptOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
